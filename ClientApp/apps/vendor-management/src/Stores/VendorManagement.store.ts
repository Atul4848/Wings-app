import {
  CityModel,
  CountryModel,
  HttpClient,
  IAPICity,
  IAPICountry,
  IAPIResponse,
  IAPIState,
  NO_SQL_COLLECTIONS,
  StateModel,
  baseApiPath,
} from '@wings/shared';
import { observable, action } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { VendorManagmentModel } from '../Modules/Shared/Models';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities, tapWithAction } from '@wings-shared/core';
import { vendorManagementHeaders } from './Base.store';
import { apiUrls } from './API.url';
import { IAPIResponseVendor } from '../Modules/Shared/Interfaces/Response/API-Response-Vendor';
import { VendorLocationAddressModel } from '../Modules/Shared/Models/VendorLocationAddress.model';
import { VendorAddressModel } from '../Modules/Shared/Models/VendorAddress.model';
import { ENVIRONMENT_VARS, EnvironmentVarsStore } from '@wings-shared/env-store';
import { UserModel } from '../Modules/Shared/Models/User.model';
import { VendorUserModel } from '../Modules/Shared/Models/VendorUser.model';
import { VendorUserResponseModel } from '../Modules/Shared/Models/VendorUserResponse.model';
import { UserGroupModel } from '../Modules/Shared/Models/UserGroup.model';

const env = new EnvironmentVarsStore();
export const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export const vendorManagementHeadersNew = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.VENDOR_MANAGEMENT_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};
export class VendorManagementStore {
  @observable public selectedVendor: VendorManagmentModel;
  @observable public vendorList: VendorManagmentModel[] = [];
  @observable public vendorAddress: VendorAddressModel[] = [];
  @observable public countries: CountryModel[] = [];
  @observable public states: StateModel[] = [];
  @observable public cities: CityModel[] = [];
  @observable isCellDisable: boolean = false;
  @observable public isVendorStatusFieldRequired = false;

  @action
  public getVMSComparison(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<VendorManagmentModel>> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: 'Vendor',
      ...pageRequest,
    });
    return http.get<IAPIPageResponse<IAPIResponseVendor>>(`/${apiUrls.vendorManagement}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        this.vendorList = VendorManagmentModel.deserializeList(response.results);
        return { ...response, results: this.vendorList };
      })
    );
  }

  @action
  public getVMSAddressComparison(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<VendorManagmentModel>> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: 'Vendor',
      ...pageRequest,
    });
    return http.get<IAPIPageResponse<IAPIResponseVendor>>(`/${apiUrls.vendorManagement}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        this.vendorAddress = VendorAddressModel.deserializeList(response.results[0].vendorAddress);
        return { ...response, results: this.vendorAddress };
      })
    );
  }

  @action
  public getVendorById(id?: number): Observable<IAPIResponseVendor> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: vendorManagementHeaders,
    });
    return http.get<IAPIPageResponse<IAPIResponseVendor>>(`/${apiUrls.vendor}/${id}`).pipe(
      Logger.observableCatchError,
      map(response => VendorManagmentModel.deserialize(response))
    );
  }

  @action
  public upsertVendor(
    payload: VendorManagmentModel,
    isInvitationPacketSend?: boolean
  ): Observable<VendorManagmentModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    payload.id = payload.id === null ? 0 : payload.id;
    const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
    const upsertRequest: Observable<VendorManagmentModel> = isNewRequest
      ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendor}`, payload)
      : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendor}/${payload.id}`, payload);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => VendorManagmentModel.deserialize(response)),
      tap(() => !isInvitationPacketSend && AlertStore.info('Vendor data saved successfully!'))
    );
  }

  public searchVendor = (searchKey: string): void => {
    const pageRequest: IAPIGridRequest = {
      searchCollection: JSON.stringify([
        { propertyName: 'Name', propertyValue: searchKey },
        { propertyName: 'Code', propertyValue: searchKey, operator: 'or' },
      ]),
    };
    this.getVMSComparison(pageRequest).subscribe();
  };

  public getVmsCountryCode(request?: IAPIGridRequest): Observable<IAPIPageResponse<CountryModel>> {
    this.states = [];
    this.cities = [];
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 500,
      collectionName: NO_SQL_COLLECTIONS.COUNTRY,
      sortCollection: JSON.stringify([{ propertyName: 'CommonName', isAscending: true }]),
      ...request,
    });
    return http.get<IAPIPageResponse<IAPICountry>>(`${apiUrls.refData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: CountryModel.deserializeList(response.results) })),
      tapWithAction(response => (this.countries = response.results))
    );
  }

  public searchCountryCode = (searchKey: string): void => {
    const pageRequest: IAPIGridRequest = {
      searchCollection: JSON.stringify([{ propertyName: 'ISO2Code', propertyValue: searchKey }]),
    };
    this.getVmsCountryCode(pageRequest).subscribe();
  };

  public getVmsStates(request?: IAPIGridRequest, searchKey?: string): Observable<IAPIPageResponse<StateModel>> {
    this.cities = [];
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      ...request,
      collectionName: NO_SQL_COLLECTIONS.STATE,
      pageNumber: 1,
      pageSize: 500,
      sortCollection: JSON.stringify([{ propertyName: 'CommonName', propertyValue: searchKey, isAscending: true }]),
    });
    return http.get<IAPIPageResponse<IAPIState>>(`${apiUrls.refData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: StateModel.deserializeList(response.results) })),
      tapWithAction(response => (this.states = response.results))
    );
  }

  public searchCity = (searchKey: string): void => {
    const pageRequest: IAPIGridRequest = {
      filterCollection: JSON.stringify([{ propertyName: 'CommonName', propertyValue: searchKey }]),
    };
    this.getVmsCities(pageRequest).subscribe();
  };

  public getVmsCities(request?: IAPIGridRequest): Observable<IAPIPageResponse<CityModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 500,
      collectionName: NO_SQL_COLLECTIONS.CITY,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPICity>>(`${apiUrls.refData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: CityModel.deserializeList(response.results) })),
      tapWithAction(response => (this.cities = response.results))
    );
  }

  public upsertVendorAddress(payload: VendorLocationAddressModel): Observable<VendorLocationAddressModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    payload.id = payload.id === null ? 0 : payload.id;
    const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
    const upsertRequest: Observable<VendorLocationAddressModel> = isNewRequest
      ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorAddress}`, payload)
      : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorAddress}/${payload.id}`, payload);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Vendor Address data saved successfully!')),
      map(response => VendorLocationAddressModel.deserialize(response))
    );
  }

  public removVendorAddress(vendorAddressId: number): Observable<string> {
    const payload = {
      userId: 'string',
      vendorAddressId,
    };
    const http = new HttpClient({ headers: vendorManagementHeaders });
    return http.delete<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorAddress}`, payload).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('Vendor Address data deleted successfully!'))
    );
  }

  public createNewUser(data: UserModel): Observable<string> {
    const headers = {
      'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
      'Ocp-Apim-Trace': true,
    };
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    const { csdUserId, email, userName, firstName, lastName, password, groupIds, preferences } = data;
    const payload = {
      CSDUserId: csdUserId,
      Email: email,
      FirstName: firstName,
      LastName: lastName,
      Username: userName || email,
      Password: password,
      Preferences: preferences,
      GroupIds: groupIds,
      SendActivationEmail: false,
      GenerateTempPassword: true,
    };
    return http.post<IAPIResponse<string>>(apiUrls.createNewUser, payload).pipe(
      Logger.observableCatchError,
      map(response => response.Data)
    );
  }

  public sendNewEmail(user: VendorUserModel, tempPassword?: string, vendorId: string): Observable<string> {
    const env = new EnvironmentVarsStore();
    const headers = {
      'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.VENDOR_MANAGEMENT_SUBSCRIPTION_KEY),
      'Ocp-Apim-Trace': true,
    };
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.vendorManagementCoreUrl, headers });
    const tPassword = btoa(JSON.stringify(tempPassword));
    const payload = {
      userId: '',
      emailTo: user.email,
      isSendEmail:user.phoneNo?false:true,
      isSendSMS:user.phoneNo?true:false,
      smsTo:user.phoneNo,
      tempPassword: tPassword,
      vendorId: vendorId,
    };
    return http.post<IAPIResponse<string>>(apiUrls.vendorUserEmail, payload).pipe(
      Logger.observableCatchError,
      map(response => response.Data)
    );
  }

  public updateOktaUser(data: UserModel): Observable<string> {
    const env = new EnvironmentVarsStore();
    const headers = {
      'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
      'Ocp-Apim-Trace': true,
    };
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    const { csdId, email, firstName, lastName, username, password, groupIds, preferences } = data;
    const payload = {
      CSDUserId: csdId,
      Email: email,
      FirstName: firstName,
      LastName: lastName,
      Username: username || email,
      Password: password,
      Preferences: preferences,
      GroupIds: groupIds,
      SendActivationEmail: false,
      GenerateTempPassword: true,
    };
    return http.put<IAPIResponse<string>>(apiUrls.createNewUser, payload).pipe(
      Logger.observableCatchError,
      map(response => response.Data)
    );
  }
}
