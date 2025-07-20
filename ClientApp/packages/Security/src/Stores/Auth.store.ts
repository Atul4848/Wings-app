import { action, computed, observable, runInAction } from 'mobx';
import {
  AccessToken,
  AuthState,
  OktaAuth,
  OktaAuthOptions,
  TokenResponse,
  Tokens,
  UserClaims,
} from '@okta/okta-auth-js';
import { ALERT_TYPES, AlertStore } from '@uvgo-shared/alert';
import Logger from '../Tools/Logger';
import { EMPTY, forkJoin, from, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, switchMap, take, tap } from 'rxjs/operators';
import { UserModel } from '../Models/User.model';
import Axios from 'axios';
import { USER_GROUP } from '../Enums/UserGroup.enum';
import { LicenseManager } from 'ag-grid-enterprise';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { EventEmitter, EVENT } from '@wings-shared/core';
import { ModeStore } from '@wings-shared/mode-store';
import { PermissionsStore } from './Permissions.store';
import { HttpClient } from '@wings/shared';

/* istanbul ignore next */
class AuthStore {
  private readonly env = new EnvironmentVarsStore();
  @observable private _user: UserModel = null;
  @observable private _authClient: OktaAuth;
  @observable public permissions: PermissionsStore = new PermissionsStore();
  @observable public buildVersion: string = '1.0.0.0';
  @observable private config: OktaAuthOptions = {
    postLogoutRedirectUri: window.location.origin,
    redirectUri: window.location.origin,
    pkce: true,
    scopes: [
      'wings.client',
      'openid',
      'email',
      'profile',
      'offline_access',
      'users.manage',
      'fiq.manage',
      'fuel.manage',
      'referencedata.manage',
      'core.manage',
      'flightplanning.manage',
    ],
    tokenManager: {
      storage: 'localStorage',
      expireEarlySeconds: 120,
      autoRenew: true,
    },
    devMode: !!localStorage.debugger,
  };

  public async getAccessToken(): Promise<AccessToken> {
    const tokens = await this._authClient.tokenManager.getTokens();
    return tokens.accessToken;
  }

  /**
   * name
   */
  public configureStore() {
    this.configure();
    LicenseManager.setLicenseKey(this.env.getVar(ENVIRONMENT_VARS.AG_GRID_LICENSE_KEY));
  }

  /**
   * Setup Ag Grid License
   */
  public configureAgGrid() {
    LicenseManager.setLicenseKey(this.env.getVar(ENVIRONMENT_VARS.AG_GRID_LICENSE_KEY));
  }

  public get user(): UserModel {
    return this._user;
  }

  public getUserAsync(): Observable<UserModel | null> {
    return this._user
      ? of(this._user)
      : from(this._authClient.tokenManager?.getTokens()).pipe(
          tap(() => runInAction(() => this._authClient.authStateManager?.updateAuthState())),
          switchMap((tokens: Tokens) =>
            tokens.accessToken && tokens.idToken
              ? from(this._authClient.token?.getUserInfo(tokens.accessToken, tokens.idToken))
              : of(null)
          )
        );
  }

  @computed
  public get isAuthenticated(): boolean {
    return this._user?.isAuthenticated;
  }

  public get isLoginRedirect(): boolean {
    return this._authClient.isLoginRedirect instanceof Function ? this._authClient.isLoginRedirect() : false;
  }

  @action
  public configure(config?: OktaAuthOptions): void {
    this.config = { ...config, ...this.config };
    this._authClient = new OktaAuth(this.config);

    this._authClient.authStateManager?.subscribe((authState: AuthState) => {
      if (authState.isAuthenticated) {
        const claim: UserClaims = { ...authState.accessToken?.claims, ...authState.idToken?.claims };
        const { accessToken } = authState.accessToken;
        const updated = authState.isAuthenticated !== this.isAuthenticated;
        updated ? this.onUserLoaded(claim, accessToken) : Object.assign(this._user, { ...claim, accessToken });
      }
    });
  }

  public authenticate(): Observable<void> {
    if (this._authClient.isLoginRedirect()) {
      return from(this._authClient.token.parseFromUrl()).pipe(
        catchError(err => {
          Logger.error('Parse token from url error', err);
          return throwError(err);
        }),
        switchMap((response: TokenResponse) => {
          return this._authClient.handleLoginRedirect(response.tokens);
        }),
        take(1)
      );
    }

    return from(this._authClient.signInWithRedirect());
  }

  public logout(): Observable<void> {
    if (!this._authClient || !this._authClient.signOut) return of();

    return forkJoin([from(this._authClient.signOut()), from(this._authClient.closeSession())]).pipe(
      map(() => null),
      finalize(() => {
        runInAction(() => {
          this._authClient.authStateManager.updateAuthState();
          this._authClient.authStateManager.unsubscribe();
          this.onUserUnloaded();
        });
      })
    );
  }

  public userHasAccess(group: USER_GROUP): boolean {
    return this.isAuthenticated && this.user.hasAccess(group);
  }

  public getBuildVersion(): void {
    Axios.get(`${this.env.getVar(ENVIRONMENT_VARS.WINGS_BASE_URL)}/api/v1/info/version`).then(
      response => (this.buildVersion = response.data)
    );
  }

  // Need to callback to check if permissions are loaded or not
  getUserPermissions(finalizeCallback: Function = () => {}): void {
    this.getAccessToken().then((accessToken: AccessToken) => {
      const headers = {
        'Ocp-Apim-Subscription-Key': this.env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
      };
      const baseURL: string = this.env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_BASE_API);
      const userGUID: string = accessToken?.claims?.userGUID;
      const url: string = `/api/v3/users/${userGUID}`;
      const http: HttpClient = new HttpClient({ baseURL, headers });

      if (localStorage.debugger) {
        console.log('baseURL', baseURL);
        console.log('userGUID', userGUID);
        console.log('headers', headers);
      }

      if (!userGUID) {
        return;
      }

      http
        .get(url)
        .pipe(
          finalize(() => finalizeCallback()),
          map((response: any) => response.Data),
          catchError((error: any) => {
            AlertStore.showAlert({
              id: 'getUserPermissions',
              message: 'Cannot get user permissions. Please try again or contact support.',
              type: ALERT_TYPES.CRITICAL,
            });
            console.error('getUserPermissions', error);
            return EMPTY;
          })
        )
        .subscribe((response: any) => this.permissions.setDataFromApi(response));
    });
  }

  @action
  onUserLoaded(claims: UserClaims, accessToken: string): void {
    const newUser = new UserModel(claims, accessToken);
    newUser.isAuthenticated = true;
    Logger.setAuthenticatedUserContext(claims);
    this._user = newUser;
    EventEmitter.emit(EVENT.SET_USER_DATA, newUser);
  }

  @action
  onUserUnloaded() {
    this._user = null;
    ModeStore.reset();
  }
}

const authStore = new AuthStore();
export default authStore;
