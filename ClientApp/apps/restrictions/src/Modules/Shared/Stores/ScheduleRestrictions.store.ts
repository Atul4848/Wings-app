import {
  baseApiPath,
  FIRModel,
  HttpClient,
  IAPIFIR,
  NO_SQL_COLLECTIONS,
} from '@wings/shared';
import { AlertStore } from '@uvgo-shared/alert';
import { observable } from 'mobx';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IAPIScheduleRestrictions } from '../Interfaces';
import { ScheduleRestrictionsModel } from '../Models';
import { apiUrls } from './API.url';
import { HealthAuthStore } from './HealthAuth.store';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, tapWithAction, Utilities } from '@wings-shared/core';

export class ScheduleRestrictionsStore extends HealthAuthStore {
  @observable public scheduleRestrictions: ScheduleRestrictionsModel[] = [];
  @observable public firs: FIRModel[] = [];

  /* istanbul ignore next */
  public getScheduleRestrictions(
    pageRequest?: IAPIGridRequest
  ): Observable<IAPIPageResponse<ScheduleRestrictionsModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const sortCollection = [{ propertyName: 'RestrictionType.Name', isAscending: true }];
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.SCHEDULE_RESTRICTION,
      sortCollection: JSON.stringify(sortCollection),
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIScheduleRestrictions>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: ScheduleRestrictionsModel.deserializeList(response.results) })),
      tapWithAction(response => (this.scheduleRestrictions = response.results))
    );
  }

  /* istanbul ignore next */
  public upsertScheduleRestrictions(requestModel?: IAPIScheduleRestrictions): Observable<ScheduleRestrictionsModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.restrictions });
    const isNewRequest: boolean = requestModel?.id === 0;
    const upsertRequest: Observable<IAPIScheduleRestrictions> = isNewRequest
      ? http.post<IAPIScheduleRestrictions>(apiUrls.scheduleRestriction, requestModel)
      : http.put<IAPIScheduleRestrictions>(`${apiUrls.scheduleRestriction}/${requestModel?.id}`, requestModel);

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIScheduleRestrictions) => ScheduleRestrictionsModel.deserialize(response)),
      tap(() => AlertStore.info(`Schedule Restriction ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public getFIRs(request?: IAPIGridRequest): Observable<FIRModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.FIR,
      ...request,
    });
    return http
      .get<IAPIPageResponse<IAPIFIR>>(
        `${apiUrls.referenceData}?${params}${Utilities.getSpecifiedFieldParams([ 'FIRId', 'Name', 'Code' ])}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => FIRModel.deserializeList(response.results)),
        tapWithAction(response => (this.firs = response))
      );
  }
}
