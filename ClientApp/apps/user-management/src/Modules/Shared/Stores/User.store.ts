import {
  baseApiPath,
  BaseStore,
  HttpClient,
  IAPIResponse,
} from '@wings/shared';
import { catchError, map, tap } from 'rxjs/operators';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { apiUrls } from './API.url';
import {
  UserResponseModel,
  UserGroupModel,
  CSDUserModel,
  LookupUserModel,
  CSDProfileModel,
  UserCacheModel,
  OracleUser,
  UserModel,
  UserFactsModel,
  UserLevelRoleModel,
  PreferencesModel,
  TeamContactModel,
  SalesPersonModel,
  UserProfileRolesModel,
  CustomerModel,
} from '../Models';
import {
  IAPIPagedUserRequest,
  IAPIUserGroupsResponse,
  IAPIAssignGroupResponse,
  IAPIRemoveGroupResponse,
  IAPIMigrateUserResponse,
  IAPIMigrateUserRequest,
  IAPIUserResponse,
  IAPIUserDataResponse,
  IAPIUpdateUserEndDateRequest,
  IAPIImportJobResponse,
  IAPICSDUserResponse,
  IAPICSDMappingRequest,
  IAPILookupUserResponse,
  IAPIBaseUpdateUserRequest,
  IAPIOrcaleUser,
  IAPIUserFactsResponse,
  IAPIUserV3Response,
  IPreferencesResponse,
  IAPIUserV3Request,
} from '../Interfaces';
import { AlertStore } from '@uvgo-shared/alert';
import { action, observable } from 'mobx';
import { USER_STATUS } from '../Enums';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, IAPIPascalResponse, ISelectOption, Utilities } from '@wings-shared/core';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class UserStore extends BaseStore {
  @observable public userGroups: UserGroupModel[] = [];
  @observable public users: UserResponseModel[] = [];
  @observable public CSDUser: CSDUserModel;
  @observable public userFilter: ISelectOption[];
  @observable public providerFilter: string = 'All';
  @observable public predicateFilter: string = 'allow';
  @observable public userId: string = '';
  @observable public oktaUserId: string = '';
  @observable public userDetails: CSDUserModel = new CSDUserModel();
  @observable public jobRoles: ISelectOption;
  @observable public roles: UserLevelRoleModel[] = [];
  @observable public preferences: PreferencesModel[] = [];
  @observable public userRoles: UserProfileRolesModel[] = [];
  @observable public userData: UserResponseModel = new UserResponseModel({ id: '' });
  @observable public rolesField: UserProfileRolesModel[] = [];
  @observable public userGuid: string = '';
  @observable public updatedUserData: UserModel;
  @observable public isRoleUpdate: boolean  = false;
  @observable public selectedActiveCustomer: CustomerModel;
  @observable public customer: CustomerModel[] = [];
  @observable public schema: string[] = [];

  @action
  public setSchema(data: string[]){
    this.schema = data;
  }

  @action
  public setCustomer(data: CustomerModel[]){
    this.customer = data;
  }

  @action
  public setSelectedActiveCustomer(data: CustomerModel){
    this.selectedActiveCustomer = data;
  }

  @action
  public updatedUser(user: UserModel) {
    if (user.id == this.userGuid) {
      this.updatedUserData = user;
    }
  }
  @action
  public setUserGuid(guid: string) {
    this.userGuid = guid;
  }

  @action
  public setRolesField(data: UserProfileRolesModel[]) {
    this.rolesField = data;
  }

  @action
  public setRolesUpdate(isUpdate: boolean = false) {
    this.isRoleUpdate = isUpdate;
  }

  public setUserData(data: UserResponseModel) {
    this.userData = data;
  }

  public setUserFilter(filter: ISelectOption[]) {
    this.userFilter = filter;
  }

  public setJobRoles(selection: ISelectOption) {
    this.jobRoles = selection;
  }

  public setRoles(selection: UserLevelRoleModel[]) {
    this.roles = selection;
  }

  public setUserRoles(selection: UserProfileRolesModel[]) {
    this.userRoles = selection;
  }

  public setPreferences(selection: PreferencesModel[]) {
    this.preferences = selection;
  }

  public setProviderFilter(filter: string) {
    this.providerFilter = filter;
  }

  public setPredicateFilter(filter: string) {
    this.predicateFilter = filter;
  }

  public setUserId(id: string) {
    this.userId = id;
  }

  public setOktaUserId(id: string) {
    this.oktaUserId = id;
  }

  public setUserDetail(data: CSDUserModel) {
    this.userDetails = data[0] ?? data;
  }

  /* istanbul ignore next */
  public loadUsers(request?: IAPIPagedUserRequest): Observable<IAPIUserDataResponse> {
    const params = Utilities.buildParamString({
      ...request,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIPascalResponse<IAPIUserResponse>>(`${apiUrls.user}?${params}`).pipe(
      Logger.observableCatchError,
      //TODO: Need to fix interface. API return data: {}, but have to return Data: {}
      map(response => (this.users = response.Data)),
      map(response => ({
        ...response,
        results: UserResponseModel.deserializeList(response.Results),
        after: response.After,
      }))
    );
  }

  /* istanbul ignore next */
  public getUserData(userId: string): Observable<UserResponseModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIResponse<IAPIUserResponse>>(apiUrls.getUserData(userId)).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIUserResponse>) => UserResponseModel.deserialize(response.Data))
    );
  }

  /* istanbul ignore next */
  public upsertUserData(request: IAPIBaseUpdateUserRequest): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.put<IAPIResponse<boolean>>(apiUrls.update, request).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<boolean>) => response.Data),
      tap(() => AlertStore.info('User Updated successfully.'))
    );
  }

  /* istanbul ignore next */
  public loadUserGroups(id: string): Observable<UserGroupModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIUserGroupsResponse>(apiUrls.userGroups(id)).pipe(
      Logger.observableCatchError,
      map((response: IAPIUserGroupsResponse) =>
        Utilities.customArraySort<UserGroupModel>(UserGroupModel.deserializeList(response.Data), 'name')
      ),
      tap((userGroups: UserGroupModel[]) => (this.userGroups = userGroups))
    );
  }

  /* istanbul ignore next */
  public assignGroup(id: string, groupId: string): Observable<IAPIAssignGroupResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http
      .post<IAPIAssignGroupResponse>(apiUrls.userGroups(id), { groupId })
      .pipe(
        Logger.observableCatchError,
        tap(() => AlertStore.info('Group added successfully for selected user.'))
      );
  }

  /* istanbul ignore next */
  public removeGroup(id: string, groupId: string): Observable<IAPIRemoveGroupResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.delete<IAPIRemoveGroupResponse>(apiUrls.removeGroup(id, groupId)).pipe(
      Logger.observableCatchError,
      tap(() => {
        this.userGroups = this.userGroups.filter(x => x.id !== groupId);
      }),
      tap(() => AlertStore.info('Group removed successfully for selected user.'))
    );
  }

  /* istanbul ignore next */
  public migrateUser(
    username: string,
    overrideImport: boolean,
    isFederated: boolean,
    csdUserId: number,
  ): Observable<IAPIResponse<IAPIMigrateUserResponse>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    const payload: IAPIMigrateUserRequest = {
      Username: username,
      OverrideAutoMapping: overrideImport,
      IsFederated: isFederated,
      CSDUserId: csdUserId
    };
    return http.post<IAPIResponse<IAPIMigrateUserResponse>>(apiUrls.migrate, payload).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIMigrateUserResponse>) => response)
    );
  }

  /* istanbul ignore next */
  public loadCsdUsers(
    search: string,
    userIds: number[] = [],
    includeServicesNProducts: boolean = false
  ): Observable<CSDUserModel[]> {
    let params = Utilities.buildParamString({ search });
    params += `&includeServicesNProducts=${includeServicesNProducts}`;
    const userIdsParams = userIds.reduce((element, userId) => {
      element += `userIds=${userId}&`;
      return element;
    }, '');

    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPIResponse<IAPICSDUserResponse>>(`${apiUrls.csdUser}?${params}&${userIdsParams}`).pipe(
      Logger.observableCatchError,
      map(response => Utilities.customArraySort<CSDUserModel>(CSDUserModel.deserializeList(response.Data), 'name'))
    );
  }

  /* istanbul ignore next */
  public addRemoveCsduser(request: IAPICSDMappingRequest, username?: string): Observable<IAPIResponse<boolean>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.put<IAPIResponse<boolean>>(apiUrls.mapCsdUser, request).pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info(`CSD Mapping ${request.CSDUserId ? 'added' : 'removed'} for ${username}.`))
    );
  }

  /* istanbul ignore next */
  public toggleActivation(userId: string, status: string): Observable<IAPIResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    const request =
      status === USER_STATUS.DEPROVISIONED
        ? http.post(apiUrls.activate(userId), {})
        : http.delete(apiUrls.deactivate(userId));
    return request.pipe(
      Logger.observableCatchError,
      tap((response: IAPIResponse) => AlertStore.info(response.Data))
    );
  }

  /* istanbul ignore next */
  public reactivate(userId: string): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.post<IAPIResponse<string>>(apiUrls.reactivate(userId), {}).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<string>) => response.Data)
    );
  }

  /* istanbul ignore next */
  public updateEndDate(request: IAPIUpdateUserEndDateRequest): Observable<IAPIResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.put(apiUrls.update, request).pipe(
      Logger.observableCatchError,
      tap((response: IAPIResponse) => {
        if (response?.Data) {
          AlertStore.info('Updated end date successfully.');
        }
      })
    );
  }

  /* istanbul ignore next */
  public enqueueImportJob(): Observable<IAPIResponse<IAPIImportJobResponse>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.post<IAPIResponse<IAPIImportJobResponse>>(apiUrls.enqueueImportJob, {}).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIImportJobResponse>) => response)
    );
  }

  /* istanbul ignore next */
  public updateEmail(
    userId: number,
    email: string,
    setLoginEmail: string,
    resetEmails: string
  ): Observable<IAPIResponse<boolean>> {
    const params = Utilities.buildParamString({
      userId,
      email,
      setLoginEmail,
      resetEmails,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.put(`${apiUrls.updateEmail}?${params}`, null).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<boolean>) => response)
    );
  }

  /* istanbul ignore next */
  public sendVerificationEmail(email: string): Observable<IAPIResponse<string>> {
    const params = Utilities.buildParamString({ email });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http
      .get<IAPIResponse<string>>(`${apiUrls.resendActivationCode}?${params}`)
      .pipe(Logger.observableCatchError);
  }

  /* istanbul ignore next */
  public deleteUser(userId: string): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.delete<IAPIResponse<string>>(apiUrls.deleteUser(userId)).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<string>) => response.Data)
    );
  }

  /* istanbul ignore next */
  public revokeToken(userId: string): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http
      .put<IAPIResponse<string>>(apiUrls.tokens, { userId })
      .pipe(
        Logger.observableCatchError,
        map((response: IAPIResponse<string>) => response.Data)
      );
  }

  /* istanbul ignore next */
  public unlockUser(userId: string): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.post<IAPIResponse<boolean>>(apiUrls.unlockUser(userId), {}).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<boolean>) => response.Data),
      catchError(err => {
        AlertStore.critical(err.message);
        return throwError(err);
      })
    );
  }

  /* istanbul ignore next */
  public updateUser(user: UserResponseModel, isAdded: boolean, isAssumeIdentity: boolean = false): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.put<IAPIResponse<boolean>>(apiUrls.user, user.serialize()).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<boolean>) => response.Data),
      tap((isUpdated: boolean) => {
        if (isUpdated) {
          AlertStore.info(
            `${isAssumeIdentity ? 'Assume' : 'Allowed'} Identity is ${isAdded ? 'added' : 'removed'} for selected user.`
          );
        }
      }),
      catchError(err => {
        AlertStore.critical(err.message);
        return throwError(err);
      })
    );
  }

  /* istanbul ignore next */
  public lookupUser(csdUserId: number, email: string): Observable<LookupUserModel> {
    const params = Utilities.buildParamString({ csdUserId, email });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIResponse<IAPILookupUserResponse>>(`${apiUrls.lookup}?${params}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPILookupUserResponse>) => LookupUserModel.deserialize(response.Data))
    );
  }

  /* istanbul ignore next */
  public expirePassword(userId: string): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.put<IAPIResponse<string>>(apiUrls.expirePassword(userId), {}).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<string>) => response.Data),
      catchError(err => {
        AlertStore.critical(err.message);
        return throwError(err);
      })
    );
  }


  /* istanbul ignore next */
  public resetPassword(userId: string): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.put<IAPIResponse<string>>(apiUrls.resetPassword(userId), {}).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<string>) => response.Data),
      catchError(err => {
        AlertStore.critical(err.message);
        return throwError(err);
      })
    );
  }

  /* istanbul ignore next */
  public assignUserToGroup(groupId: string, userId: string): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.post(apiUrls.userToGroup(userId), { groupId }).pipe(
      Logger.observableCatchError,
      map(response => response?.Data.IsSuccess),
      tap(isSuccess => {
        if (isSuccess) {
          AlertStore.info('User added successfully to Group.');
        }
      })
    );
  }

  /* istanbul ignore next */
  public removeUserFromGroup(userId: string, groupId: string): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.delete(apiUrls.removeUserFromGroup(userId, groupId)).pipe(
      Logger.observableCatchError,
      map(response => response?.Data.IsSuccess),
      tap(isSuccess => {
        if (isSuccess) {
          AlertStore.info('User removed successfully from group.');
        }
      })
    );
  }
  
  /* istanbul ignore next */
  public updateCsdUserProfile(request: CSDProfileModel): Observable<IAPIResponse<boolean>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.put(`${apiUrls.updateCSDProfile}`, request).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<boolean>) => response)
    );
  }

  /* istanbul ignore next */
  public getCsdUserProfile(userId: number, includeServicesNProducts: boolean = false): Observable<CSDUserModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http
      .get<IAPIResponse<IAPICSDUserResponse>>(
        `${apiUrls.csdUser}?userIds=${userId}&includeUnverified=${includeServicesNProducts}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => CSDUserModel.deserialize(response.Data[0]))
      );
  }

  /* istanbul ignore next */
  public searchUsersCache(query: string): Observable<UserCacheModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIResponse<IAPICSDUserResponse>>(`${apiUrls.getUsersCache}?q=${query}`).pipe(
      Logger.observableCatchError,
      map(response => UserCacheModel.deserializeList(response?.Data))
    );
  }

  /* istanbul ignore next */
  public getUser(id: string): Observable<UserModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIResponse<IAPIUserV3Response>>(`${apiUrls.userProfiles}/${id}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIUserV3Response>) => UserModel.deserializeV3(response.Data))
    );
  }

  /* istanbul ignore next */
  public getUsers(request?: IAPIGridRequest): Observable<IAPIPageResponse<UserModel>> {
    let statusParam = '';
    const agGridRequest: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: 30,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
      ...request,
    };

    const sort = JSON.parse(agGridRequest.sortCollection || '')[0];

    const params = Utilities.buildParamString({
      q: agGridRequest?.q || '',
      Provider: agGridRequest?.provider,
      Page: agGridRequest?.pageNumber || 1,
      Size: agGridRequest?.pageSize || 30,
      sort: sort.propertyName,
      dir: sort.isAscending ? 'ASC' : 'DESC',
    });
    if (!request?.provider) {
      delete agGridRequest.Provider;
    }
    if(request?.status?.length){
      statusParam = `&Status=${(request.status as string[]).join('&Status=')}`
    }
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIPageResponse<IAPIUserV3Response>>(`${apiUrls.userProfiles}?${params}${statusParam}`).pipe(
      Logger.observableCatchError,
      map(response => {
        return {
          totalNumberOfRecords: response.Data.TotalNumberOfRecords,
          pageNumber: response.Data.PageNumber,
          pageSize: response?.Data.PageSize,
          results: UserModel.deserializeListV3(response.Data.Results),
        };
      })
    );
  }

  /* istanbul ignore next */
  public upsertUser(id: string, user: IAPIUserV3Request): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.put<IAPIResponse<boolean>>(`${apiUrls.userProfiles}/${id}`, user).pipe(
      Logger.observableCatchError,
      tap(() => {
        AlertStore.info('User updated successfully.');
      })
    );
  }

  /* istanbul ignore next */
  public userAudit(id: string): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIResponse<string>>(`${apiUrls.userProfiles}/${id}/audit`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<string>) => response.Data)
    );
  }

  /* istanbul ignore next */
  public createNewUser(
    csdUserId: number,
    email: string,
    username: string,
    firstName: string,
    lastName: string,
    sendActivationEmail: boolean,
    generateTempPassword: boolean,
    password: null,
    preferences: null,
    groupIds: string[],
  ): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    const payload: any = {
      CSDUserId: csdUserId,
      Email: email,
      Username: username,
      FirstName: firstName,
      LastName: lastName,
      SendActivationEmail: sendActivationEmail,
      GenerateTempPassword: generateTempPassword,
      Password: password,
      Preferences: preferences,
      GroupIds: groupIds,
    };
    return http.post<IAPIResponse<string>>(apiUrls.createNewUser, payload)
      .pipe(
        Logger.observableCatchError,
        map((response: any) => response.Data)
      );
  }

  /* istanbul ignore next */
  public getPreferences(userGuid: string): Observable<PreferencesModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIResponse<IPreferencesResponse>>(apiUrls.userPreferences(userGuid)).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IPreferencesResponse[]>) =>
        Utilities.customArraySort<PreferencesModel>(PreferencesModel.deserializeList(response?.Data ?? []), 'name')
      )
    );
  }

  /* istanbul ignore next */
  public searchOracleUsers(query: string): Observable<OracleUser[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi, headers });
    return http.get<IAPIResponse<IAPIOrcaleUser>>(`${apiUrls.getOracleUsers}?Query=${query}`).pipe(
      Logger.observableCatchError,
      map(response => OracleUser.deserializeList(response?.Data?.Results ?? []))
    );
  }

  /* istanbul ignore next */
  public getUserFacts(actorId: string): Observable<UserFactsModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.authorizationApi, headers });
    return http.get<IAPIResponse<IAPIUserFactsResponse>>(`${apiUrls.userFacts(actorId, this.predicateFilter)}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIUserFactsResponse>) => UserFactsModel.deserialize(response?.Data), 'actorId')
    );
  }

  /* istanbul ignore next */
  public checkAuthorize(
    resourceId: string,
    action: string,
    actorId: string,
    actorType: string,
    resourceType: string
  ): Observable<UserFactsModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.authorizationApi, headers });
    const payload: any = {
      ResourceId: resourceId,
      Action: action,
      ActorId: actorId,
      ActorType: actorType,
    };
    return http.post<IAPIResponse<string>>(apiUrls.checkAuthorize(resourceType), payload)
      .pipe(
        Logger.observableCatchError,
        map((response: any) => response.Data)
      );
  }

  /* istanbul ignore next */
  public getFactExplorer(
    predicate: string,
    actorType: string,
    actorId?: string,
    action?: string,
    resourceType?: string,
    resourceId?: string
  ): Observable<UserFactsModel> {
    const paramsObj = {
      Predicate: predicate,
      ActorType: actorType,
      ActorId: actorId,
      Action: action,
      ResourceType: resourceType,
      ResourceId: resourceId
    };
    if (!actorId) {
      delete paramsObj.ActorId;
    }
    if (!action) {
      delete paramsObj.Action;
    }
    if (!resourceId) {
      delete paramsObj.ResourceId;
    }
    const params = Utilities.buildParamString(paramsObj);
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.authorizationApi, headers });
    return http.get<IAPIResponse<IAPIUserFactsResponse>>(`${apiUrls.checkFactExplorer}?${params}`)
      .pipe(
        Logger.observableCatchError,
        map((response: IAPIResponse<IAPIUserFactsResponse>) => UserFactsModel.deserialize(response?.Data), 'actorId')
      );
  }

  /* istanbul ignore next */
  public salesPersons(): Observable<SalesPersonModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPIResponse<string>>(apiUrls.salesPersons).pipe(
      Logger.observableCatchError,
      map((response: any) => SalesPersonModel.deserializeList(response.Data))
    );
  }

  /* istanbul ignore next */
  public teamContacts(): Observable<TeamContactModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPIResponse<string>>(apiUrls.teamContacts).pipe(
      Logger.observableCatchError,
      map((response: any) => TeamContactModel.deserializeList(response.Data))
    );
  }

  public assignRoles(requestData: any[]): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    const requests = requestData.map(request => http.post<IAPIResponse<string>>(apiUrls.assignRoles, request));

    return forkJoin(requests);
  }

  public unassignRoles(requestData: any[]): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    const requests = requestData.map(request => http.post<IAPIResponse<string>>(apiUrls.unassignRoles, request));

    return forkJoin(requests);
  }

  public getUserRoles(userGuid: string): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    const url: string = `/api/v3/users/${userGuid}/roles`;

    return http
      .get(url)
      .pipe(
        map((response: any) => response.Data),
        map((response: any) => UserProfileRolesModel.deserializeList(response)),
      );
  }

  public updateRoles({ userGuid, role }): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    const url: string = `/api/v3/users/${userGuid}/roles`;
    const body = { Roles: [ role ] };

    return http
      .put(url, body)
      .pipe(
        Logger.observableCatchError,
        map((response: any) => response.Data),
        map((response: any) => UserProfileRolesModel.deserializeList(response)),
      );
  }

  public deleteRole({ userGuid, userRoleId }): Observable<void> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    const url: string = `/api/v3/users/${userGuid}/roles/${userRoleId}`;

    return http.delete(url).pipe(Logger.observableCatchError);
  }

  private getRolesForApi(roles: UserProfileRolesModel[]): Partial<UserProfileRolesModel>[] {
    return roles.map(role => {
      const serializedRole: IAPIUserProfileRoleResponse = role.serialize();
      const apiRole: any = {
        RoleId: serializedRole.RoleId,
        Attributes: serializedRole.Attributes,
      }

      if (serializedRole.UserRoleId) {
        apiRole.UserRoleId = serializedRole.UserRoleId;
      }

      if (role.isExternal && serializedRole.ValidFrom && serializedRole.ValidTo) {
        apiRole.IsTrial = serializedRole.IsTrial;
      }

      if (serializedRole.ValidFrom) {
        apiRole.ValidFrom = serializedRole.ValidFrom;
      }

      if (serializedRole.ValidTo) {
        apiRole.ValidTo = serializedRole.ValidTo;
      }

      return apiRole;
    });
  }

  /* istanbul ignore next */
  public getSchema(): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIResponse<string>>(apiUrls.schema).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<string>) => response.Data)
    );
  }

  /* istanbul ignore next */
  public exportUsers(
    attributes: string,
    status: string,
    q: string,
    provider: string,
  ): Observable<UserFactsModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    const statusArray = status.split(',').map(s => s.trim());
    const payload: any = {
      Attributes: attributes,
      Status: statusArray,
      Q: q,
      Provider: provider,
    };
    return http.post<IAPIResponse<string>>(apiUrls.exportUsers, payload)
      .pipe(
        Logger.observableCatchError,
        map((response: any) => response.Data)
      );
  }
}


