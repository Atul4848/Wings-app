import { baseApiPath, BaseStore, HttpClient, NO_SQL_COLLECTIONS } from '@wings/shared';
import { action, observable } from 'mobx';
import { Observable } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { AirframeModel } from '../Models';
import { apiUrls } from './API.url';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIAirframe } from '../Interfaces';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, tapWithAction, Utilities } from '@wings-shared/core';

export class AirframeStore extends BaseStore {
  @observable public airframes: AirframeModel[] = [];

  /* istanbul ignore next */
  public getAirframes(): Observable<AirframeModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const params: string = Utilities.buildParamString({
      pageSize: 0,
    });
    return http.get(`${apiUrls.airframe}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => AirframeModel.deserializeList(response.results)),
      tapWithAction(airframes => (this.airframes = airframes))
    );
  }

  /* istanbul ignore next */
  public getAirframById(id: number): Observable<AirframeModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const params: string = Utilities.buildParamString({ pageSize: 0 });
    return http.get(`${apiUrls.airframeById(id)}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => AirframeModel.deserialize(response))
    );
  }

  /* istanbul ignore next */
  @action
  public upsertAirframe(request: AirframeModel): Observable<AirframeModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIAirframe> = isNewRequest
      ? http.post<IAPIAirframe>(apiUrls.airframe, request.serialize())
      : http.put<IAPIAirframe>(`${apiUrls.airframe}/${request.id}`, request.serialize());

    return upsertRequest.pipe(
      map((response: IAPIAirframe) => AirframeModel.deserialize(response)),
      tap(() => AlertStore.info(`Airframe ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public getAirframesNoSQL(request?: IAPIGridRequest): Observable<IAPIPageResponse<AirframeModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.AIRFRAME,
      sortCollection: JSON.stringify([{ propertyName: 'SerialNumber', isAscending: true }]),
      ...request,
    });

    return http.get<IAPIPageResponse<IAPIAirframe>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      map(response => ({ ...response, results: AirframeModel.deserializeList(response.results) })),
      tapWithAction(airframes => (this.airframes = airframes.results))
    );
  }
}
