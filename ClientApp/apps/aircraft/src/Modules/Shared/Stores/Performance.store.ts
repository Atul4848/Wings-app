import { baseApiPath, BaseStore, HttpClient, NO_SQL_COLLECTIONS } from '@wings/shared';
import { PerformanceModel } from '../Models';
import { action, observable } from 'mobx';
import { Observable, of } from 'rxjs';
import { apiUrls } from './API.url';
import { IAPIPerformance, IAPIPerformanceRequest, IAPIPerformanceResponse } from '../Interfaces';
import { map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, tapWithAction, Utilities } from '@wings-shared/core';

export class PerformanceStore extends BaseStore {
  @observable public performances: PerformanceModel[] = [];

  constructor() {
    super();
  }

  /* istanbul ignore next */
  public getPerformances(
    forceRefresh?: boolean,
    pageRequest?: IAPIGridRequest
  ): Observable<IAPIPageResponse<PerformanceModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    if (!forceRefresh && this.performances.length) {
      return of(this.performances);
    }
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.PERFORMANCE,
      ...pageRequest,
    });
    return http.get<IAPIPageResponse<IAPIPerformance>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: PerformanceModel.deserializeList(response.results) })),
      tapWithAction(response => (this.performances = response.results))
    );
  }

  /* istanbul ignore next */
  public getPerformanceById(request?: IAPIGridRequest): Observable<PerformanceModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.PERFORMANCE,
      ...request,
    });
    return http.get<IAPIPageResponse<PerformanceModel>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => PerformanceModel.deserialize(response.results[0]))
    );
  }

  /* istanbul ignore next */
  @action
  public upsertPerformance(request: PerformanceModel): Observable<PerformanceModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<any> = isNewRequest
      ? http.post<IAPIPerformanceRequest>(apiUrls.performance, request.serialize())
      : http.put<IAPIPerformanceRequest>(`${apiUrls.performance}/${request.id}`, request.serialize());

    return upsertRequest.pipe(
      map((response: IAPIPerformanceResponse) => PerformanceModel.deserialize(response)),
      tap(() => AlertStore.info(`Performance ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public deletePerformanceRecord(performanceId: number): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    return http
      .delete<string>(apiUrls.performance, { performanceId })
      .pipe(
        Logger.observableCatchError,
        map(() => 'Performance Record deleted successfully!'),
        tap(response => AlertStore.info(response))
      );
  }
}
