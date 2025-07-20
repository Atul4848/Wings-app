import {
  baseApiPath,
  BaseStore,
  HttpClient,
} from '@wings/shared';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { map } from 'rxjs/operators';
import { IAPIExecutionSummary } from '../Interfaces';
import { ExecutionSummaryModel } from '../Models';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.EVENTS_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class ExecutionSummaryStore extends BaseStore {

  /* istanbul ignore next */
  public getExecutionSummary(): Observable<ExecutionSummaryModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPIExecutionSummary[]>>(apiUrls.executionSummary).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIExecutionSummary[]>) =>
        Utilities.customArraySort<ExecutionSummaryModel>
        (ExecutionSummaryModel.deserializeList(response.Data), 'executionSummaryId'))
    )
  }

  /* istanbul ignore next */
  public getExecutionSummaryByEventId(eventId: number): Observable<ExecutionSummaryModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPIExecutionSummary>>(apiUrls.executionSummaryByEventId(eventId)).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIExecutionSummary>) => ExecutionSummaryModel.deserialize(response.Data))
    )
  }
}
