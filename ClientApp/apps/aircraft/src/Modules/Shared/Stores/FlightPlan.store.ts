import { baseApiPath, HttpClient, NO_SQL_COLLECTIONS, BaseStore } from '@wings/shared';
import { AlertStore } from '@uvgo-shared/alert';
import { action, observable } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { FlightPlanModel, FlightPlanChangeRecordModel } from '../Models';
import { IAPIFlightPlan } from '../Interfaces';
import { apiUrls } from './API.url';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities, tapWithAction } from '@wings-shared/core';

export class FlightPlanStore extends BaseStore {
  @observable public flightPlans: FlightPlanModel[] = [];

  /* istanbul ignore next */
  public getFlightPlans(
    forceRefresh?: boolean,
    pageRequest?: IAPIGridRequest
  ): Observable<IAPIPageResponse<FlightPlanModel>> {
    const specifiedFields = [
      'Format',
      'FlightPlanFormatStatus',
      'LastUsedDate',
      'BuiltBy',
      'BuiltDate',
      'ContactForChanges',
      'Notes',
      'AccessLevel',
      'SourceType',
      'Status',
      'ModifiedOn',
      'ModifiedBy',
      'CreatedBy',
      'CreatedOn',
      'FlightPlanFormatAccounts',
      'FlightPlanFormatId',
    ];
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.FLIGHT_PLAN_FORMAT,
      sortCollection: JSON.stringify([{ propertyName: 'Format', isAscending: true }]),
      ...pageRequest,
    });

    if (this.flightPlans?.length && !forceRefresh) {
      return of({ results: this.flightPlans, pageNumber: 1, pageSize: 10, totalNumberOfRecords: 10 });
    }
    return http
      .get<IAPIPageResponse<IAPIFlightPlan>>(
        `${apiUrls.referenceData}?${params}${Utilities.getSpecifiedFieldParams(specifiedFields)}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => ({ ...response, results: FlightPlanModel.deserializeList(response.results) })),
        tapWithAction(response => (this.flightPlans = response.results))
      );
  }

  /* istanbul ignore next */
  public getFlightPlanById(request?: IAPIGridRequest): Observable<IAPIPageResponse<FlightPlanModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      collectionName: NO_SQL_COLLECTIONS.FLIGHT_PLAN_FORMAT,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIFlightPlan>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: FlightPlanModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public getFlightPlanChnageRecords(): Observable<FlightPlanChangeRecordModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const params: string = Utilities.buildParamString({
      pageSize: 0,
    });
    return http.get(`${apiUrls.flightPlanFormatChangeRecord}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => FlightPlanChangeRecordModel.deserializeList(response.results))
    );
  }

  /* istanbul ignore next */
  @action
  public upsertFlightPlan(request: FlightPlanModel): Observable<FlightPlanModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIFlightPlan> = isNewRequest
      ? http.post<IAPIFlightPlan>(apiUrls.flightPlan, request.serialize())
      : http.put<IAPIFlightPlan>(`${apiUrls.flightPlan}/${request.id}`, request.serialize());

    return upsertRequest.pipe(
      map((response: IAPIFlightPlan) => FlightPlanModel.deserialize(response)),
      tap(() => AlertStore.info(`Flight plan Format ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }
}
