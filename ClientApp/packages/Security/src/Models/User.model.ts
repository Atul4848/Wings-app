import { UserClaims } from '@okta/okta-auth-js';
import { USER_GROUP } from '../Enums';

export class UserModel implements UserClaims {
  [propName: string]: any;
  auth_time?: number;
  aud?: string;
  email?: string;
  email_verified?: boolean;
  exp?: number;
  family_name?: string;
  given_name?: string;
  iat?: number;
  iss?: string;
  jti?: string;
  locale?: string;
  name?: string;
  nonce?: string;
  preferred_username?: string;
  sub: string;
  updated_at?: number;
  ver?: number;
  zoneinfo?: string;
  accessToken: string;
  // contains array like: [ 'uwa.wings.app.admin', 'uwa.wings.app.general' ]
  private readonly _authorizationGroups: string[];
  public isAuthenticated: boolean = false;

  constructor(user: UserClaims, accessToken?: string, authorizationGroups?: string[]) {
    Object.assign(this, user);
    this.accessToken = accessToken || '';
    this._authorizationGroups = this.deserializeGroups(accessToken, authorizationGroups);
  }

  public hasAccess(group: USER_GROUP): boolean {
    return this._authorizationGroups
    .some(g => g.toLowerCase() === `uwa.wings.app.${group}`.toLowerCase());
  }

  public get isSystemAdmin(): boolean {
    return this.hasAccess(USER_GROUP.SYSTEM_ADMIN);
  }

  public get isAdminUser(): boolean {
    return this.hasAccess(USER_GROUP.ADMIN);
  }

  public get isQRGAdmin(): boolean {
    return this.hasAccess(USER_GROUP.QRG_ADMIN);
  }

  public get isQRGDataManagement(): boolean {
    return this.hasAccess(USER_GROUP.QRG_DATA_MANAGEMENT);
  }

  public get isFPAdmin(): boolean {
    return this.hasAccess(USER_GROUP.FP_ADMIN);
  }

  public get isGeneralUser(): boolean {
    return this.hasAccess(USER_GROUP.GENERAL);
  }

  public get isDataManagerUser(): boolean {
    return this.hasAccess(USER_GROUP.DATA_MANAGEMENT);
  }

  public get isUaUser(): boolean {
    return this.hasAccess(USER_GROUP.UA_USER);
  }

  public get isUwaMarketingUser(): boolean {
    return this.hasAccess(USER_GROUP.UWA_MARKETING);
  }

  public get isVendorManagementAdmin(): boolean {
    return this.hasAccess(USER_GROUP.VENDOR_MANAGEMENT_ADMIN);
  }

  public get authorizationGroups(): USER_GROUP[] {
    return this._authorizationGroups
      .map(group => Object.values(USER_GROUP)
      .find(v => `uwa.wings.app.${v.toLowerCase()}` === group.toLowerCase()))
      .filter(g => Boolean(g));
  }

  private deserializeGroups(token: string, groups?: string[]): string[] {
    if (groups) {
      return this.allowedGroups(groups);
    }

    return this.decodeJWT(token)?.group || [];
  }

  private allowedGroups(groups: string[]): string[] {
    return groups.filter(g => g.toLowerCase().includes('uwa.wings.app.'));
  }

  private decodeJWT(token: string): { group: string[] } {
    try {
      // one of the props of access_token is group
      // which contains array of string like uwa.Wings.App.Admin
      const parsed: { group?: string[] } = JSON.parse(atob(token.split('.')[1]));
      return {
        group: this.allowedGroups(parsed?.group || []),
      };
    } catch {
      return { group: [] };
    }
  }
}
