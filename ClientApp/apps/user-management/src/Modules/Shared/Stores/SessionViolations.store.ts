import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { IAPISessionViolationResponse } from '../Interfaces';
import { SessionViolationsModel } from '../Models';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';
import { observable } from 'mobx';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class SessionViolationsStore extends BaseStore {
  @observable public sessionData: SessionViolationsModel[] = [];

  public setSessionData(selection: SessionViolationsModel[]) {
    this.sessionData = selection;
  }

  public getSessionViolations(): Observable<SessionViolationsModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIResponse<IAPISessionViolationResponse[]>>(apiUrls.sessionviolations).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPISessionViolationResponse[]>) =>
        Utilities.customArraySort<SessionViolationsModel>
        (SessionViolationsModel.deserializeList(response.Data), 'violationCount').reverse())
    )
  }

  /* istanbul ignore next */
  public deleteSessionViolations(oktaUserId: string): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.delete<IAPIResponse<string>>(apiUrls.deleteSessionViolations(oktaUserId)).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<string>) => response.Data)
    );
  }
}
