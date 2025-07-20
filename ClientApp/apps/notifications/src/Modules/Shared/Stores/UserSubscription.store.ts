import {
  baseApiPath,
  BaseStore,
  HttpClient,
  IAPIResponse,
  IAPIPagedUserRequest,
  IAPIUserResponse,
} from '@wings/shared';
import { observable } from 'mobx';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  IAPIAddUserSubscriptionRequest,
  IAPISubscriptionResponse,
  IAPIUpdtateSubscriptionRequest,
} from '../Interfaces';
import { UserModel, UserSubscriptionModel } from '../Models';
import { apiUrls } from './API.url';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';
import { IAPIPascalResponse, Utilities } from '@wings-shared/core';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.EVENTS_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class SubscriptionStore extends BaseStore {
  @observable public users: UserModel[] = [];
  @observable public selectedUserSubscriptions: UserSubscriptionModel[] = [];
  @observable public selectedUser: UserModel|null = new UserModel();
  @observable public isContactPage: boolean = false;

  /* istanbul ignore next */
  public loadUsers(request?: IAPIPagedUserRequest): Observable<UserModel[]> {
    const params = Utilities.buildParamString({
      ...request,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIResponse<IAPIPascalResponse<IAPIUserResponse>>>(`${apiUrls.user}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => UserModel.deserializeList(response.Data.Results))
    );
  }

  /* istanbul ignore next */
  public addUserSubscription(request: IAPIAddUserSubscriptionRequest): Observable<UserSubscriptionModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.post<IAPIResponse<IAPISubscriptionResponse>>(`${apiUrls.userSubscription}`, request).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPISubscriptionResponse>) => UserSubscriptionModel.deserialize(response.Data))
    );
  }

  /* istanbul ignore next */
  public userSubscriptions(customerNumber: string): Observable<UserSubscriptionModel[]> {
    const params = Utilities.buildParamString({
      customerNumber,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPISubscriptionResponse[]>>(`${apiUrls.userSubscription}?${params}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPISubscriptionResponse[]>) =>
        Utilities.customArraySort<UserSubscriptionModel>(UserSubscriptionModel.deserializeList(response.Data), 'name')
      ),
      tap((subscriptions: UserSubscriptionModel[]) => (this.selectedUserSubscriptions = subscriptions))
    );
  }

  /* istanbul ignore next */
  public toggleSubscriptionActivation(request: IAPIUpdtateSubscriptionRequest): Observable<UserSubscriptionModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.put<IAPIResponse<IAPISubscriptionResponse>>(`${apiUrls.toggleSubscriptionActivation}`, request).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPISubscriptionResponse>) => UserSubscriptionModel.deserialize(response.Data)),
      tap((subscription: UserSubscriptionModel) => {
        const updatedSubscription = this.selectedUserSubscriptions.find(x => x.id == subscription.id);
        if (updatedSubscription) {
          updatedSubscription.isEnabled = subscription.isEnabled;
        }
      })
    );
  }

  /* istanbul ignore next */
  public getSubscriptionByIdentifier(identifier: string) {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPISubscriptionResponse>>(`${apiUrls.userSubscription}/${identifier}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPISubscriptionResponse>) => UserSubscriptionModel.deserialize(response.Data))
    );
  }

  /* istanbul ignore next */
  public searchSubscriptions(
    searchValue: string,
    isEnabled: boolean = false,
    includeInactive = false
  ): Observable<UserSubscriptionModel[]> {
    const params = Utilities.buildParamString({
      searchValue,
      isEnabled,
      includeInactive,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPISubscriptionResponse[]>>(`${apiUrls.userSubscription}/search?${params}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPISubscriptionResponse[]>) =>
        Utilities.customArraySort<UserSubscriptionModel>(UserSubscriptionModel.deserializeList(response.Data), 'name')
      ),
      tap((subscriptions: UserSubscriptionModel[]) => (this.selectedUserSubscriptions = subscriptions))
    );
  }
}
