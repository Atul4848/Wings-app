import { ENVIRONMENT_VARS, EnvironmentVarsStore } from '@wings-shared/env-store';
import { BaseStore } from './Base.store';
import { IAPIGridRequest, IAPIPageResponse, Utilities, tapWithAction } from '@wings-shared/core';
import { Observable } from 'rxjs';
import { observable } from 'mobx';
import { UserRefModel } from '../Models';
import { map } from 'rxjs/operators';
import { baseApiPath } from '../API';
import { userManagementApiUrls } from './ApiUrls';
import { IAPIUserRef } from '../Interfaces';
import { HttpClient } from '../Tools';
import { Logger } from '@wings-shared/security';

export class BaseUserStore extends BaseStore {
  private env = new EnvironmentVarsStore();
  private userHeaders = {
    'Ocp-Apim-Subscription-Key': this.env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
    'Ocp-Apim-Trace': true,
  };

  @observable public users: UserRefModel[] = [];

  /* istanbul ignore next */
  public getUsers(request?: IAPIGridRequest): Observable<IAPIPageResponse<UserRefModel>> {
    const paramsObj = {
      q: request?.q || '',
      Status: request?.status === 'ALL' ? '' : request?.status,
      Provider: request?.provider,
      Page: request?.pageNumber || 1,
      Size: request?.pageSize || 100,
    };
    if (!request?.status && request?.provider !== 'ALL') {
      delete paramsObj.Status;
    }
    if (!request?.provider) {
      delete paramsObj.Provider;
    }
    const params = Utilities.buildParamString(paramsObj);
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers: this.userHeaders });
    return http.get<IAPIPageResponse<IAPIUserRef>>(`${userManagementApiUrls.userRef}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        return {
          totalNumberOfRecords: response.Data.TotalNumberOfRecords,
          pageNumber: response.Data.PageNumber,
          pageSize: response?.Data.PageSize,
          results: Utilities.customArraySort<UserRefModel>(
            UserRefModel.deserializeList(response.Data.Results),
            'label'
          ),
        };
      }),
      tapWithAction(userResponse => (this.users = userResponse.results))
    );
  }
}
