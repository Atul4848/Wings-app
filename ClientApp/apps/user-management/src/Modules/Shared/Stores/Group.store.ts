import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { IAPIUserGroupsResponse, IAPIUserGroupsRequest, IAPIUserGroup, IAPIGroupsUsersResponse } from '../Interfaces';
import { AlertStore } from '@uvgo-shared/alert';
import { UserGroupModel, GroupsUsersModel } from '../Models';
import { observable } from 'mobx';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class GroupStore extends BaseStore {
  @observable public userGroups: UserGroupModel[] = [];

  /* istanbul ignore next */
  public loadGroups(query?: string): Observable<UserGroupModel[]> {
    const params = Utilities.buildParamString({ query });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIUserGroupsResponse>(`${apiUrls.groups}?${params}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIUserGroupsResponse) =>
        Utilities.customArraySort<UserGroupModel>(UserGroupModel.deserializeList(response.Data), 'name')
      )
    );
  }

  /* istanbul ignore next */
  public loadGroupUsers(id: string): Observable<GroupsUsersModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIGroupsUsersResponse>(apiUrls.groupsUsers(id)).pipe(
      Logger.observableCatchError,
      map((response: IAPIGroupsUsersResponse) =>
        Utilities.customArraySort<GroupsUsersModel>(GroupsUsersModel.deserializeList(response.Data), 'firstName')
      )
    );
  }

  /* istanbul ignore next */
  public upsertGroup(userGroup: IAPIUserGroupsRequest): Observable<UserGroupModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    const isNewRequest: boolean = userGroup.Id === null;
    const upsertRequest: Observable<IAPIResponse<IAPIUserGroupsRequest>> = isNewRequest
      ? http.post<IAPIResponse<IAPIUserGroupsRequest>>(apiUrls.groups, userGroup)
      : http.put<IAPIResponse<IAPIUserGroupsRequest>>(apiUrls.groups, userGroup);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIUserGroup>) =>
        UserGroupModel.deserialize(response.Data)),
      tap(() => AlertStore.info(`Group ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public deleteGroup(id: string): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement });
    return http.delete<IAPIResponse<string>>(apiUrls.deleteGroup(id)).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<string>) => response.Data)
    );
  }
}
