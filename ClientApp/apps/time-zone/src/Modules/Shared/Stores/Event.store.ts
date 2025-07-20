import { EventModel, ExportedEventsErrorModel, ImportWorldEventModel, WorldEventsReviewModel } from '../Models';
import {
  BaseCountryStore,
  CityModel,
  HttpClient,
  IAPICity,
  StateModel,
  baseApiPath,
  NO_SQL_COLLECTIONS,
} from '@wings/shared';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';
import {
  IAPICityFilter,
  IAPIEvent,
  IAPIExportedEventsError,
  IAPIFaaMergeResponse,
  IAPIImportWorldEvent,
  IAPIWorldEventReview,
} from '../Interfaces';
import { map, tap } from 'rxjs/operators';
import { apiUrls } from './API.url';
import { Observable } from 'rxjs';
import { AlertStore } from '@uvgo-shared/alert';
import { observable } from 'mobx';
import { Logger } from '@wings-shared/security';

export class EventStore extends BaseCountryStore {
  @observable public events: EventModel[] = [];

  /* istanbul ignore next */
  public getEvents(request?: IAPIGridRequest): Observable<IAPIPageResponse<EventModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.WORLDEVENT,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIEvent>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: EventModel.deserializeList(response.results) })),
      tap(response => (this.events = response.results))
    );
  }

  /* istanbul ignore next */
  public upsertEvent(event: EventModel): Observable<EventModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const isNewRequest: boolean = event.id === 0;
    const upsertRequest: Observable<IAPIEvent> = isNewRequest
      ? http.post<IAPIEvent>(apiUrls.event, event.serialize())
      : http.put<IAPIEvent>(`${apiUrls.event}/${event.id}`, event.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIEvent) => EventModel.deserialize(response)),
      tap(() => AlertStore.info(`Event ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public removeEvent(worldEventId: number): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    return http
      .delete<string>(apiUrls.event, { worldEventId })
      .pipe(
        Logger.observableCatchError,
        tap(() => AlertStore.info('Event deleted successfully!'))
      );
  }

  public getCityFilters(countryIds: number[], states?: StateModel[]): IAPICityFilter[] {
    let cityFilters: IAPICityFilter[] = [];

    if (Array.isArray(states) && states.length) {
      const filteredStates: StateModel[] = states.filter((state: StateModel) => countryIds.includes(state.countryId));
      cityFilters = filteredStates.map((state: StateModel) => ({ countryId: state.countryId, stateId: state.id }));

      const filteredCountryIds: number[] = countryIds.filter(
        (countryId: number) => !states.some((state: StateModel) => countryId === state.countryId)
      );

      if (Array.isArray(filteredCountryIds) && filteredCountryIds.length) {
        cityFilters = cityFilters.concat(filteredCountryIds.map((countryId: number) => ({ countryId })));
      }

      return cityFilters;
    }

    return countryIds.map((countryId: number) => ({ countryId }));
  }

  /* istanbul ignore next */
  public getCitiesByCountries(countryIds: number[], states?: StateModel[]): Observable<CityModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });

    const params: string = Utilities.buildParamString({
      pageSize: 0,
      FilterCollection: JSON.stringify(this.getCityFilters(countryIds, states)),
    });

    return http.get<IAPIPageResponse<IAPICity>>(`${apiUrls.city}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => CityModel.deserializeList(response.results))
    );
  }

  /* istanbul ignore next */
  public uploadEventData(file: File): Observable<File> {
    const data: FormData = new FormData();
    data.append('file', file);
    data.append('StatusId', '1');
    data.append('SourceTypeId', '1');
    data.append('AccessLevelId', '1');
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    return http.post(apiUrls.importEvent, data).pipe(Logger.observableCatchError);
  }

  /* istanbul ignore next */
  public getEventExcelFile(): Observable<File> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.timezones,
      responseType: 'blob',
    });
    const params: string = Utilities.buildParamString({ pageSize: 0 });
    return http.get(`${apiUrls.eventExcel}?${params}`).pipe(Logger.observableCatchError);
  }

  /* istanbul ignore next */
  public getExportedEvents(request?: IAPIGridRequest): Observable<IAPIPageResponse<ImportWorldEventModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIImportWorldEvent>>(`${apiUrls.importedEvents}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: ImportWorldEventModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public getExportedEventsErrors(runId?: string): Observable<ExportedEventsErrorModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    return http.get<IAPIExportedEventsError>(apiUrls.importedEventsErrors(runId)).pipe(Logger.observableCatchError);
  }

  /* istanbul ignore next */
  public downloadWorldEventTemplate(): Observable<File> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.timezones,
      responseType: 'blob',
    });
    return http.get(`${apiUrls.downloadWorldEventTemplate}`).pipe(Logger.observableCatchError);
  }

  //World Event Uplink
  /* istanbul ignore next */
  public getWorldEventReview(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<WorldEventsReviewModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIWorldEventReview>>(`${apiUrls.worldEventStaging}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: WorldEventsReviewModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public getWorldEventReviewList(rowIndex?: number): Observable<WorldEventsReviewModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    return http
      .get<IAPIPageResponse<IAPIWorldEventReview>>(`${apiUrls.worldEventStaging}/UplinkPropertyList/${rowIndex}`)
      .pipe(
        Logger.observableCatchError,
        map(response => WorldEventsReviewModel.deserialize(response))
      );
  }

  /* istanbul ignore next */
  public approveWorldEventStaging(request): Observable<IAPIFaaMergeResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    return http.put<string[]>(`${apiUrls.worldEventStaging}/Approve/${request.uplinkStagingId}`, request).pipe(
      Logger.observableCatchError,
      tap(resp => {
        resp.hasErrors
          ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
          : AlertStore.info('Records Approved successfully!');
      })
    );
  }

  /* istanbul ignore next */
  public rejectWorldEventStaging(request): Observable<IAPIFaaMergeResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    return http.put<string[]>(`${apiUrls.worldEventStaging}/Reject/${request.uplinkStagingId}`, request).pipe(
      Logger.observableCatchError,
      tap(resp => {
        resp.hasErrors
          ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
          : AlertStore.info('Records Rejected successfully!');
      })
    );
  }

  /* istanbul ignore next */
  public updateWorldEventStaging(request): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    return http.put<string[]>(`${apiUrls.worldEventStagingRegion}/${request.uplinkStagingPropertyId}`, request).pipe(
      Logger.observableCatchError,
      tap(resp => {
        resp.hasErrors
          ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
          : AlertStore.info('Region updated successfully!');
      })
    );
  }
}
