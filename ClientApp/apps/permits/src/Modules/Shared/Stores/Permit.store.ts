import {
  HttpClient,
  baseApiPath,
  NO_SQL_COLLECTIONS,
  CountryModel,
  IAPICountry,
  StateModel,
  IAPIState,
  BaseAirportStore,
  FIRModel,
  IAPIFIR,
  UplinkStagingReviewModel,
} from '@wings/shared';
import { apiUrls } from './API.url';
import {
  AerodromeReferenceCodeModel,
  DMNoteModel,
  PermitInfoReviewModel,
  PermitModel,
  PermitUplinkStagingReviewModel,
} from '../Models';
import {
  IAPIAerodromeReferenceCode,
  IAPIDMNote,
  IAPIPermit,
  IAPIPermitInfoReview,
  IAPIUplinkPermitInfoReview,
} from '../Interfaces';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { action, observable } from 'mobx';
import { AlertStore } from '@uvgo-shared/alert';
import { Logger } from '@wings-shared/security';
import {
  IAPIGridRequest,
  IAPIPageResponse,
  IBaseApiResponse,
  Utilities,
  tapWithAction,
  SettingsTypeModel,
  IdNameCodeModel,
  IAPIIdNameCode,
} from '@wings-shared/core';

export class PermitStore extends BaseAirportStore {
  @observable permitDataModel: PermitModel = new PermitModel();
  @observable countries: CountryModel[] = [];
  @observable permits: PermitModel[] = [];
  @observable states: StateModel[] = [];
  @observable regions: SettingsTypeModel[] = [];
  @observable firs: FIRModel[] = [];
  @observable aircraftCategories: SettingsTypeModel[] = [];
  @observable aerodromeReferenceCodes: AerodromeReferenceCodeModel[] = [];
  @observable airportOfEntries: IdNameCodeModel[] = [];
  @observable dMNoteModel: DMNoteModel = new DMNoteModel();

  private http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });

  public setPermitDataModel(updatedPermitDataModel: PermitModel): void {
    this.permitDataModel = updatedPermitDataModel;
  }

  /* istanbul ignore next */
  public loadPermits(request?: IAPIGridRequest): Observable<IAPIPageResponse<PermitModel>> {
    const params: string = Utilities.buildParamString({
      collectionName: NO_SQL_COLLECTIONS.PERMIT,
      pageNumber: 1,
      pageSize: 30,
      ...request,
    });

    return this.http.get<IAPIPageResponse<IAPIPermit>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      map(response => ({ ...response, results: PermitModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public upsertPermit(permit: PermitModel): Observable<PermitModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.permits });

    const isAddPermit: boolean = permit.id === 0;
    const upsertRequest: Observable<IAPIPermit> = isAddPermit
      ? http.post<IAPIPermit>(apiUrls.permit, permit.serialize())
      : http.put<IAPIPermit>(`${apiUrls.permit}/${permit.id}`, permit.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIPermit) => PermitModel.deserialize(response)),
      tap(() => AlertStore.info(`Permit ${isAddPermit ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public getCountries(forceRefresh?: boolean): Observable<CountryModel[]> {
    if (this.countries?.length && !forceRefresh) {
      return of(this.countries);
    }

    const specifiedFields = [ 'CountryId', 'CommonName', 'OfficialName', 'ISO2Code', 'ISO3Code', 'Status' ];

    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.COUNTRY,
      sortCollection: JSON.stringify([{ propertyName: 'CommonName', isAscending: true }]),
    });
    return this.http
      .get<IAPIPageResponse<IAPICountry>>(
        `${apiUrls.referenceData}?${params}${Utilities.getSpecifiedFieldParams(specifiedFields)}`
      )
      .pipe(
        Logger.observableCatchError,
        takeUntil(this.reset$),
        map((response: IAPIPageResponse<IAPICountry>) => CountryModel.deserializeList(response.results)),
        tapWithAction((countries: CountryModel[]) => (this.countries = countries))
      );
  }

  /* istanbul ignore next */
  @action
  public getPermits(request?: IAPIGridRequest, specifiedFields?: string[]): Observable<PermitModel[]> {
    let params: string = Utilities.buildParamString({
      collectionName: NO_SQL_COLLECTIONS.PERMIT,
      ...request,
    });

    if ((specifiedFields?.length as number) > 0) {
      params = `${params}${Utilities.getSpecifiedFieldParams(specifiedFields as string[])}`;
    }

    return this.http.get<IAPIPageResponse<IAPIPermit>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      map((response: IAPIPageResponse<IAPIPermit>) => PermitModel.deserializeList(response.results)),
      tapWithAction((permits: PermitModel[]) => (this.permits = permits))
    );
  }

  /* istanbul ignore next */
  public getStates(request?: IAPIGridRequest): Observable<StateModel[]> {
    const specifiedFields = [ 'CommonName', 'OfficialName', 'Code', 'ISOCode', 'CappsCode', 'StateId' ];
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.STATE,
      sortCollection: JSON.stringify([{ propertyName: 'CommonName', isAscending: true }]),
      ...request,
    });
    return this.http
      .get<IAPIPageResponse<IAPIState>>(
        `${apiUrls.referenceData}?${params}${Utilities.getSpecifiedFieldParams(specifiedFields)}`
      )
      .pipe(
        Logger.observableCatchError,
        map((response: IAPIPageResponse<IAPIState>) => StateModel.deserializeList(response.results)),
        tapWithAction((states: StateModel[]) => (this.states = states))
      );
  }

  /* istanbul ignore next */
  public getRegions(): Observable<SettingsTypeModel[]> {
    if (Boolean(this.regions?.length)) {
      return of(this.regions);
    }
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.REGION,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    });
    return http.get<IAPIPageResponse<IBaseApiResponse>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(({ results }) => results.map(x => SettingsTypeModel.deserialize({ ...x, id: x.regionId }))),
      tapWithAction(response => (this.regions = response))
    );
  }

  /* istanbul ignore next */
  public getAerodromeReferenceCodes(): Observable<AerodromeReferenceCodeModel[]> {
    if (Boolean(this.aerodromeReferenceCodes?.length)) {
      return of(this.aerodromeReferenceCodes);
    }

    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const params: string = Utilities.buildParamString({
      pageSize: 0,
    });

    return http.get<IAPIPageResponse<IAPIAerodromeReferenceCode>>(`${apiUrls.aerodromeReferenceCode}?${params}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIPageResponse<IAPIAerodromeReferenceCode>) =>
        Utilities.customArraySort<AerodromeReferenceCodeModel>(
          AerodromeReferenceCodeModel.deserializeList(response.results),
          'name'
        )
      ),
      tapWithAction((response: AerodromeReferenceCodeModel[]) => (this.aerodromeReferenceCodes = response))
    );
  }

  /* istanbul ignore next */
  public getAircraftCategories(): Observable<SettingsTypeModel[]> {
    if (Boolean(this.aircraftCategories?.length)) {
      return of(this.aircraftCategories);
    }

    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const params: string = Utilities.buildParamString({
      pageSize: 0,
    });

    return http.get<IAPIPageResponse<IBaseApiResponse>>(`${apiUrls.aircraftCategory}?${params}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIPageResponse<IBaseApiResponse>) =>
        Utilities.customArraySort<SettingsTypeModel>(SettingsTypeModel.deserializeList(response.results), 'name')
      ),
      tapWithAction((response: SettingsTypeModel[]) => (this.aircraftCategories = response))
    );
  }

  /* istanbul ignore next */
  public isPermitExists(request: IAPIGridRequest, permitId: Number): Observable<boolean> {
    const specifiedFields = [ 'PermitId', 'Country', 'PermitType' ];

    const params: string = Utilities.buildParamString({
      collectionName: NO_SQL_COLLECTIONS.PERMIT,
      ...request,
    });
    return this.http
      .get<IAPIPageResponse<IAPIPermit>>(
        `${apiUrls.referenceData}?${params}${Utilities.getSpecifiedFieldParams(specifiedFields)}`
      )
      .pipe(
        Logger.observableCatchError,
        takeUntil(this.reset$),
        map((response: IAPIPageResponse<IAPIPermit>) => response.results.some(data => data.permitId !== permitId))
      );
  }

  /* istanbul ignore next */
  @action
  public executePermits(countryCode: string, permitTypeId: number, request: object): Observable<IAPIPermit[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.permits });
    const params: string = Utilities.buildParamString({ countryCode, permitTypeId });

    return http.post<IAPIPermit[]>(`${apiUrls.permitExecuteRuleV2}?${params}`, request).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      map((response: IAPIPermit[]) => response),
      catchError(err => {
        AlertStore.critical(err.message);
        return throwError(err);
      })
    );
  }

  /* istanbul ignore next */
  public getFIRs(): Observable<FIRModel[]> {
    if (Boolean(this.firs?.length)) {
      return of(this.firs);
    }

    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    const params: string = Utilities.buildParamString({
      pageSize: 0,
    });

    return http.get<IAPIPageResponse<IAPIFIR>>(`${apiUrls.fir}?${params}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIPageResponse<IAPIFIR>) =>
        Utilities.customArraySort<FIRModel>(FIRModel.deserializeList(response?.results), 'name')
      ),
      tapWithAction((response: FIRModel[]) => (this.firs = response))
    );
  }

  /* istanbul ignore next */
  public getAirportOfEntries(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<IdNameCodeModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_OF_ENTRY,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
      ...pageRequest,
    });
    return http.get<IAPIPageResponse<IAPIIdNameCode>>(`${apiUrls.airportOfEntry}?${params}`).pipe(
      map(response => {
        return {
          ...response,
          results: IdNameCodeModel.deserializeList(response.results),
        };
      }),
      tapWithAction(response => (this.airportOfEntries = response.results))
    );
  }

  /* istanbul ignore next */
  public loadPermitDMNote(permitTypeId: number): Observable<DMNoteModel> {
    const http: HttpClient = new HttpClient({ baseURL: `${baseApiPath.permits}` });
    return http.get<IAPIDMNote>(`${apiUrls.permitDMNote(permitTypeId)}`).pipe(
      Logger.observableCatchError,
      map(response => {
        return DMNoteModel.deserialize(response);
      }),
      catchError((err: any) => {
        if (err.message.toLowerCase().includes('PermitDMNote not found for PermitId'.toLowerCase())) {
          return;
        }
        AlertStore.critical(err.message);
        return throwError(err);
      })
    );
  }

  /* istanbul ignore next */
  public upsertPermitDMNote(id: number, dmNote: DMNoteModel): Observable<DMNoteModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.permits });
    const isNewNote: boolean = dmNote.id === 0;
    const upsertRequest: Observable<IAPIDMNote> = isNewNote
      ? http.post<IAPIDMNote>(apiUrls.permitDMNote(id), dmNote.serialize())
      : http.put<IAPIDMNote>(`${apiUrls.permitDMNote(id)}/${dmNote.id}`, dmNote.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIDMNote) => DMNoteModel.deserialize(response)),
      tap(() => AlertStore.info(`DM Note ${isNewNote ? 'created' : 'updated'} successfully!`))
    );
  }

  @action
  public getPermitInfoReview(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<PermitInfoReviewModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.permits });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIPermitInfoReview>>(`${apiUrls.permitUplinkStaging}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: PermitInfoReviewModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public approvePermitInfoStaging(request): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.permits });
    return http.put<string[]>(`${apiUrls.permitUplinkStaging}/Approve/${request.uplinkStagingId}`, request).pipe(
      Logger.observableCatchError,
      tap(resp => {
        resp.hasErrors
          ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
          : AlertStore.info('Records Approved successfully!');
      })
    );
  }

  /* istanbul ignore next */
  public rejectPermitInfoStaging(request): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.permits });
    return http.put<string[]>(`${apiUrls.permitUplinkStaging}/Reject/${request.uplinkStagingId}`, request).pipe(
      Logger.observableCatchError,
      tap(resp => {
        resp.hasErrors
          ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
          : AlertStore.info('Records Rejected successfully!');
      })
    );
  }

  public getPermitReviewListDetail(rowIndex?: number): Observable<IAPIPageResponse<PermitUplinkStagingReviewModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.permits });
    return http
      .get<IAPIPageResponse<IAPIUplinkPermitInfoReview>>(
        `${apiUrls.permitUplinkStaging}/PermitStagingPropertyList/${rowIndex}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => ({ ...response, results: PermitUplinkStagingReviewModel.deserializeList(response) }))
      );
  }
}
