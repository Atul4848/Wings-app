import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { IAPIUserSession } from '../Interfaces';
import { UserSessionModel } from '../Models';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class SessionStore extends BaseStore {
  /* istanbul ignore next */
  public loadSessionUsers(id: string): Observable<UserSessionModel[]> {
    const params = Utilities.buildParamString({
      oktaUserId: id,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIUserSession[]>(`${apiUrls.sessions}?${params}`).pipe(
      Logger.observableCatchError,
      map((response: any) =>
        Utilities.customArraySort<UserSessionModel>(
          UserSessionModel.deserializeList(response.Data?.Sessions),
          'clientId'
        )
      )
    );
  }

  /* istanbul ignore next */
  public deleteSession(oktaUserId: string, session: UserSessionModel): Observable<string> {
    const params = Utilities.buildParamString({
      clientId: session.clientId,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.delete<IAPIResponse<string>>(`${apiUrls.sessions}/${oktaUserId}?${params}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<string>) => response.Data)
    );
  }
}
