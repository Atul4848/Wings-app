import {
  baseApiPath,
  BaseStore,
  HttpClient,
} from '@wings/shared';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { map } from 'rxjs/operators';
import { IAPILogResponse } from '../Interfaces';
import { action, observable } from 'mobx';
import { LogModel, UserModel } from '../Models';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class LogStore extends BaseStore {
  @observable public logsFilter: string = 'ALL';
  @observable public eventFilter: string = 'NONE';
  @observable public selectedActorIDs: UserModel = new UserModel();
  @observable public startDate: string = '';
  @observable public endDate: string = '';
  @observable public selectedTargetIDs: UserModel = new UserModel();

  public setLogsFilter(filter: string) {
    this.logsFilter = filter;
  }

  public setEventFilter(filter: string) {
    this.eventFilter = filter;
  }

  public setSelectedActorIDs(user: UserModel) {
    this.selectedActorIDs = user;
  }

  public setStartDate(filter: string) {
    this.startDate = filter;
  }

  public setEndDate(filter: string) {
    this.endDate = filter;
  }

  public setSelectedTargetIDs(user: UserModel) {
    this.selectedTargetIDs = user;
  }

  /* istanbul ignore next */
  public getLog(request?: IAPIGridRequest): Observable<IAPIPageResponse<LogModel>> {
    const paramsObj = {
      query: request?.searchCollection || '',
      page: request?.pageNumber || 1,
      size: request?.pageSize || 30,
      sort: 'Timestamp',
      direction: 1,
      targetId: request.q,
      actorId: request.q,
      ...request,
    };
    if (!request?.targetId) {
      delete paramsObj.targetId;
    }
    if (!request?.actorId) {
      delete paramsObj.actorId;
    }
    const params = Utilities.buildParamString(paramsObj);
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIPageResponse<IAPILogResponse>>(`${apiUrls.logs}?${params}`).pipe(
      Logger.observableCatchError,
      map((response) => {
        return {
          totalNumberOfRecords: response.Data.TotalNumberOfRecords,
          pageNumber: response.Data.PageNumber,
          pageSize: response?.Data.PageSize,
          results: Utilities.customArraySort<LogModel>(LogModel.deserializeList(response.Data.Results), 'Timestamp'),
        }
      })
    )
  }

}