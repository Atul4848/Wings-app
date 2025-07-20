import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { map } from 'rxjs/operators';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { Logger } from '@wings-shared/security';

export class SyncTroubleshootStore extends BaseStore {
  /* istanbul ignore next */
  public triggerCachedCustomerNumber(customerNumber: string): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.post<IAPIResponse<string>>(apiUrls.triggerCachedCustomerNumber(customerNumber), {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }

  /* istanbul ignore next */
  public triggerCachedTripNumber(tripNumber: number): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.post<IAPIResponse<number>>(apiUrls.triggerCachedTripNumber(tripNumber), {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  } 

  /* istanbul ignore next */
  public reactivateArchiveTrip(tripNumber: number): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.put<IAPIResponse<number>>(apiUrls.reactivateArchieveTrip(tripNumber), {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }

  /* istanbul ignore next */
  public triggerCachedTripId(tripId: number): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.post<IAPIResponse<number>>(apiUrls.triggerCachedTripId(tripId), {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }

  /* istanbul ignore next */
  public triggerCacheReload(): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.post<IAPIResponse<number>>(apiUrls.triggerCacheReload, {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }

  /* istanbul ignore next */
  public triggerSyncInformation(tripNumber: number): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPIResponse<number>>(apiUrls.triggerSyncInformation(tripNumber)).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }

  /* istanbul ignore next */
  public triggerLoadHistoryJob(): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.post<IAPIResponse<number>>(apiUrls.triggerLoadHistoryJob, {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }

  /* istanbul ignore next */
  public clearCacheTrips(customerNumber: string): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.post<IAPIResponse<number>>(apiUrls.clearCacheTrips(customerNumber), {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }

  /* istanbul ignore next */
  public triggerArchiveLoadTripsJob(): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.post<IAPIResponse<number>>(apiUrls.triggerArchiveLoadTripsJob, {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }

  /* istanbul ignore next */
  public clearAirportsCache(): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.delete<IAPIResponse<number>>(`${apiUrls.clearAirportsCache}?key=Airports`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<boolean>) => response.Data)
    );
  }

  /* istanbul ignore next */
  public triggerCompletedTripsReload(): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.post<IAPIResponse<number>>(apiUrls.triggerCompletedTripsReload, {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }

  /* istanbul ignore next */
  public triggerAPGRegistriesJob(): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.post<IAPIResponse<number>>(apiUrls.triggerAPGRegistriesJob, {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }

  /* istanbul ignore next */
  public triggerSyncTrip(tripNumber: number, username: string): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.post<IAPIResponse<number>>(apiUrls.triggerSyncTrip(tripNumber, username), {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }

  /* istanbul ignore next */
  public refreshUserTripsByUsername(username: string): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.post<IAPIResponse<string>>(apiUrls.refreshUserTripsByUsername(username), {}).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data)
    );
  }
}