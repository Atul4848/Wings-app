import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';
import { UserFactsModel } from '../Models';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class SyncTroubleshootStore extends BaseStore {

  /* istanbul ignore next */
  public refreshUsers(): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.post<IAPIResponse<number>>(apiUrls.triggerRefreshUsersJob, {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }

  /* istanbul ignore next */
  public triggerFactsLoader(FactLoader: string): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.authorizationApi, headers });
    return http.post<IAPIResponse<number>>(`${apiUrls.triggerFactsLoader}?FactLoader=${FactLoader}`, {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }

  /* istanbul ignore next */
  public deleteTokenEnrichment(userId: string): Observable<IAPIResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http
      .delete<IAPIResponse>(`${apiUrls.deleteTokenEnrichment}?type=USER&userId=${userId}&pattern=TOKEN_ENRICHMENT`)
      .pipe(
        Logger.observableCatchError,
        tap(() => AlertStore.info(`Token enrichment for user Id: ${userId} reset successfully`))
      );
  }

  /* istanbul ignore next */
  public resyncUser(csdUsername: string, username: string, overwrite: boolean): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.post<IAPIResponse<string>>(`${apiUrls.resyncUser}?csdUsername=${csdUsername}&username=${username}&overwrite=${overwrite}`, {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }

  /* istanbul ignore next */
  public cacheCleaning(email: string): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.delete<IAPIResponse<string>>(`${apiUrls.cacheCleaning}?email=${email}&type=2`, {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }

  /* istanbul ignore next */
  public triggerRefreshCustomers(): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.post<IAPIResponse<number>>(apiUrls.triggerRefreshCustomers, {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }

  /* istanbul ignore next */
  public triggerSyncUserPreferences(overwrite: boolean): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });

    return http.post<IAPIResponse<number>>(`${apiUrls.triggerSyncUserPreferences}?overwrite=${overwrite}`, {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }

  /* istanbul ignore next */
  public factsCleanup(payload: UserFactsModel): Observable<UserFactsModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.authorizationApi, headers });
    return http.delete<IAPIResponse<string>>(apiUrls.factsCleanup, payload).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }
}
