import { HttpClient, IAPIResponse, baseApiPath } from '@wings/shared';
import { observable } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, IAPIPascalResponse, Utilities } from '@wings-shared/core';
import { vendorManagementHeaders } from './Base.store';
import { apiUrls } from './API.url';
import { IAPIResponseVendor } from '../Modules/Shared/Interfaces/Response/API-Response-Vendor';
import { ENVIRONMENT_VARS, EnvironmentVarsStore } from '@wings-shared/env-store';
import {
  IAPIPagedUserRequest,
  IAPIUserDataResponse,
  IAPIUserResponse,
  VendorUserData,
  IAPIUserGroupsResponse,
} from '../Modules/Shared/Interfaces';
import {
  VendorUserResponseModel,
  UserGroupModel,
  VendorUserModel,
  UserModel,
  VendorLocationAddressModel,
} from '../Modules/Shared/Models';
import { VENDOR_USER_DATA } from '../Modules/Shared/Constants';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class VendorUserStore {
  @observable public vendorUserList: VendorUserModel[] = [];
  @observable public vendorOktaUser: VendorUserResponseModel[] = [];
  @observable public uplinkOktaGroups: UserGroupModel[] = [];
  @observable public vendorUserData: VendorUserData = VENDOR_USER_DATA;

  public updateOktaGroup(user: UserModel): Observable<string> {
    const env = new EnvironmentVarsStore();
    const uplinkId: string = env.getVar(ENVIRONMENT_VARS.UPLINK_UI_GROUP_ID);
    const headers = {
      'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
      'Ocp-Apim-Trace': true,
    };
    const payload = {
      groupId: uplinkId,
    };
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });

    return http.post<IAPIResponse<string>>(`${apiUrls.createNewUser}/${user.userId}/groups`, payload).pipe(
      Logger.observableCatchError,
      map(response => response.Data)
    );
  }

  public getOktaUserData(request?: IAPIPagedUserRequest, emailInputValue?: string): Observable<IAPIUserDataResponse> {
    const headers = {
      'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
      'Ocp-Apim-Trace': true,
    };
    const params = Utilities.buildParamString({
      ...request,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIPascalResponse<IAPIUserResponse>>(`${apiUrls.createNewUser}?${params}`).pipe(
      Logger.observableCatchError,

      map(response => {
        const responseData = VendorUserResponseModel.deserializeList(response.Data.Results);
        if (response?.Data?.Results?.length > 0) {
          this.vendorOktaUser = responseData;
        } else {
          this.vendorOktaUser = [];
        }
        return { ...response, results: VendorUserResponseModel.deserializeList(response.Data.Results) };
      })
    );
  }

  public loadUplinkOktaGroups(query?: string): Observable<UserGroupModel[]> {
    const headers = {
      'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
      'Ocp-Apim-Trace': true,
    };
    const params = Utilities.buildParamString({ query });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIUserGroupsResponse>(`${apiUrls.oktaGroups}?${params}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIUserGroupsResponse) => {
        Utilities.customArraySort<UserGroupModel>(UserGroupModel.deserializeList(response.Data), 'name');
        this.uplinkOktaGroups = UserGroupModel.deserializeList(response.Data);
        this.uplinkOktaGroups = this.uplinkOktaGroups.filter(
          g => g.name === 'app.uplink.corporateauthorizedagent' || g.name === 'app.uplink.informationambassador'
        );
        return { ...response, results: this.uplinkOktaGroups };
      })
    );
  }

  public getVendorUser(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<VendorUserModel>> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: 'VendorUser',
      ...pageRequest,
    });
    return http.get<IAPIPageResponse<IAPIResponseVendor>>(`/${apiUrls.vendorManagement}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        this.vendorUserList = VendorUserModel.deserializeList(response.results);
        return { ...response, results: this.vendorUserList };
      })
    );
  }

  public upsertVendorUser(payload: VendorUserModel): Observable<VendorUserModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    payload.id = payload.id === null ? 0 : payload.id;
    payload.isOptedSms = payload.phoneNo ? true : false;
    const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
    const upsertRequest: Observable<VendorLocationAddressModel> = isNewRequest
      ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorUser}`, payload)
      : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorUser}/${payload.id}`, payload);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Vendor User data saved successfully!')),
      map(response => VendorUserModel.deserialize(response))
    );
  }

  public generateTempPassword(userEmail: string): Observable<string> {
    const env = new EnvironmentVarsStore();
    const headers = {
      'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
      'Ocp-Apim-Trace': true,
    };
    const payload = {
      userId: userEmail,
    };
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });

    return http.put<IAPIResponse<string>>(`${apiUrls.createNewUser}/${userEmail}/expirepassword`, payload).pipe(
      Logger.observableCatchError,
      map(response => response.Data)
    );
  }
}
