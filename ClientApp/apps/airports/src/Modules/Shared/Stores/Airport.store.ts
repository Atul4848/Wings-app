import { HttpClient, baseApiPath, BaseCountryStore, NO_SQL_COLLECTIONS } from '@wings/shared';
import { apiUrls } from './ApiUrls';
import {
  AirportFlightPlanInfoModel,
  AirportManagementModel,
  AirportModel,
  FAAImportComparisonModel,
  FAAImportProcess,
  AirportRunwayModel,
  AirportOperationalInfoModel,
  AirportMappingsBetaModel,
  AirportDiagramModel,
  AirportFrequencyModel,
  AgentProfileModel,
  RunwayClosureModel,
  AirportSecurityModel,
  AirportRunwayClosureModel,
  AssociatedRunwayModel,
  AirportHourReviewModel,
  MilitaryFieldsReviewModel,
  AirportParkingReviewModel,
  AirportPermissionModel,
  AirportDataExportModel,
  AirportHourUplinkStagingReviewModel,
} from '../Models';
import {
  IAPIAirport,
  IAPIAirportDataExport,
  IAPIAirportDataExportRequest,
  IAPIAirportFlightPlanInfoRequest,
  IAPIAirportFrequency,
  IAPIAirportHourReview,
  IAPIAirportManagement,
  IAPIAirportMappingsBeta,
  IAPIAirportOperationalInfoRequest,
  IAPIAirportPermissionRequest,
  IAPIAirportRequest,
  IAPIAirportRunway,
  IAPIAirportRunwayClosure,
  IAPIAirportSecurityRequest,
  IAPIFAAImportComparison,
  IAPIFAAImportProcess,
  IAPIFAAMergeByAirport,
  IAPIFaaImportStagingProperty,
  IAPIFaaMergeResponse,
  IAPIFrequencyRunway,
  IAPIMergeTableRequest,
  IAPIMilitaryReviewDetail,
  IAPIMilitaryUplinkStaging,
  IAPIUpdateAirportStatus,
  IAPIUpdateUWAorICAOCode,
  IAPIUplinkAirportHourReview,
  IAPIUplinkAirportParkingReview,
  IAPIUplinkResponse,
  IAPIValidateAirport,
} from '../Interfaces';
import { observable, action } from 'mobx';
import { map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { AlertStore } from '@uvgo-shared/alert';
import { AIRPORT_CODE_FIELDS, FAA_IMPORT_STAGING_ENTITY_TYPE } from '../Enums';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities, tapWithAction } from '@wings-shared/core';

export class AirportStore extends BaseCountryStore {
  @observable public isRunwayBackNav: boolean = false;
  @observable public selectedAirportPermission: AirportPermissionModel = new AirportPermissionModel();
  @observable public selectedAirport: AirportModel | null;
  @observable public selectedFaaImportProcess: FAAImportProcess;
  @observable public airports: AirportModel[] = [];
  @observable public runways: AirportRunwayModel[] = [];
  @observable public airportFrequencies: AirportFrequencyModel[] = [];

  @action
  public setIsRunwayBackNav(isRunwayBackNav: boolean): void {
    this.isRunwayBackNav = isRunwayBackNav;
  }

  @action
  public setSelectedAirport(airport: Partial<AirportModel>): void {
    this.selectedAirport = new AirportModel(airport);
  }

  @action
  public setSelectedFaaImportProcess(faaImport: Partial<FAAImportProcess>): void {
    this.selectedFaaImportProcess = new FAAImportProcess(faaImport);
  }

  @action
  public clearRunways(): void {
    this.runways = [];
  }

  /* istanbul ignore next */
  // See #75700
  // Validate Airport icaoCode uwaCode and iataCode
  public validateAirportCodes(values, airportId): Observable<AirportModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const {
      icaoCode,
      uwaAirportCode,
      regionalAirportCode,
      iataCode,
      faaCode,
      airportOfEntry,
      appliedAirportUsageType,
      airportDataSource,
      sourceLocationId,
    } = values;

    const request: IAPIValidateAirport = {
      faaCode,
      iataCode,
      sourceLocationId,
      id: Number(airportId) || 0,
      icaoCodeId: icaoCode?.id,
      regionalAirportCodeId: regionalAirportCode?.id,
      uwaAirportCodeId: uwaAirportCode?.id,
      airportOfEntryId: airportOfEntry?.id,
      airportDataSourceId: airportDataSource?.id,
      appliedAirportUsageType: appliedAirportUsageType.map(x => {
        return {
          id: x?.id,
          airportUsageTypeId: x?.entityId,
        };
      }),
    };
    const upsertRequest: Observable<IAPIAirport> = http.put<IAPIAirport>(apiUrls.validateAirport, request);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => AirportModel.deserialize(response))
    );
  }

  /* istanbul ignore next */
  @action
  public getAirports(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<AirportModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.Airports,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIAirport>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: AirportModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  @action
  public getAirportById(airportId: number): Observable<AirportModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });

    return http.get<IAPIAirport>(`${apiUrls.airports}/${airportId}`).pipe(
      Logger.observableCatchError,
      map(response => AirportModel.deserialize(response))
    );
  }

  /* istanbul ignore next */
  public upsertAirport(requestModel?: IAPIAirportRequest, isPrimaryRunway?: boolean): Observable<AirportModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const isNewRequest: boolean = requestModel?.id === 0;
    const upsertRequest: Observable<IAPIAirport> = isNewRequest
      ? http.post<IAPIAirport>(apiUrls.airports, requestModel as IAPIAirportRequest)
      : http.put<IAPIAirport>(`${apiUrls.airports}/${requestModel?.id}`, requestModel as IAPIAirportRequest);

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => AirportModel.deserialize(response)),
      tap(response => {
        if (response.hasError) {
          return;
        }
        AlertStore.info(
          `${isPrimaryRunway ? 'Primary Runway' : 'Airport'} ${isNewRequest ? 'created' : 'updated'} successfully!`
        );
      })
    );
  }

  /* istanbul ignore next */
  public updateAirportStatus(request: IAPIUpdateAirportStatus): Observable<AirportModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.put<IAPIAirport>(apiUrls.updateAirportStatus(request.airportId), request).pipe(
      map(response => AirportModel.deserialize(response)),
      tap(response => {
        if (response.hasError) {
          AlertStore.important(response?.errors[0]?.errorMessage);
          return;
        }

        AlertStore.info('Airport Status updated successfully!');
      })
    );
  }

  /* istanbul ignore next */
  private upsertRequest(
    fieldKey: AIRPORT_CODE_FIELDS,
    request: IAPIUpdateUWAorICAOCode
  ): Observable<IAPIUpdateUWAorICAOCode> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const { airportId, icaoCodeId, uwaAirportCodeId, regionalAirportCodeId, appliedAirportUsageType } = request;
    switch (fieldKey) {
      case AIRPORT_CODE_FIELDS.ICAO_CODE:
        return http.put(apiUrls.updateAirportICAOCode(airportId), {
          airportId,
          icaoCodeId,
        });
      case AIRPORT_CODE_FIELDS.UWA_CODE:
        return http.put(apiUrls.updateAirportUWACode(airportId), {
          airportId,
          id: uwaAirportCodeId,
        });
      case AIRPORT_CODE_FIELDS.REGIONAL_CODE:
        return http.put(apiUrls.updateAirportRegionalCode(airportId), {
          airportId,
          appliedAirportUsageType,
          id: regionalAirportCodeId,
        });
    }
  }

  /* istanbul ignore next */
  public updateAirportICAOOrUWAOrRegionalCode(
    fieldKey: AIRPORT_CODE_FIELDS,
    request: IAPIUpdateUWAorICAOCode
  ): Observable<AirportModel> {
    return this.upsertRequest(fieldKey, request).pipe(
      Logger.observableCatchError,
      map(response => AirportModel.deserialize(response)),
      tap(resp => {
        resp.hasErrors
          ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
          : AlertStore.info(`${fieldKey} updated successfully!`);
      })
    );
  }

  /* istanbul ignore next */
  @action
  public getAirportManagementInfo(airportId: number): Observable<AirportManagementModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });

    return http.get<IAPIAirportManagement>(apiUrls.airportManagement(airportId)).pipe(
      Logger.observableCatchError,
      map(response => AirportManagementModel.deserialize(response))
    );
  }

  /* istanbul ignore next */
  public upsertAirportManagementInfo(request: IAPIAirportManagement): Observable<AirportManagementModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const isNewRequest: boolean = request.id === 0;

    const upsertRequest: Observable<IAPIAirportManagement> = isNewRequest
      ? http.post<IAPIAirportManagement>(apiUrls.airportManagement(request.airportId), request)
      : http.put<IAPIAirportManagement>(`${apiUrls.airportManagement(request.airportId)}/${request.id}`, request);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIAirportManagement) => AirportManagementModel.deserialize(response)),
      tap(() => AlertStore.info(`Airport Management Information ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  @action
  public getAirportOperationalInfo(airportId: number): Observable<AirportOperationalInfoModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.get<AirportOperationalInfoModel>(apiUrls.airportOperationalInfo(airportId)).pipe(
      Logger.observableCatchError,
      map(response => AirportOperationalInfoModel.deserialize(response))
    );
  }

  /* istanbul ignore next */
  public upsertAirportOperationalInfo(
    request: IAPIAirportOperationalInfoRequest
  ): Observable<AirportOperationalInfoModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIAirport> = isNewRequest
      ? http.post<IAPIAirport>(apiUrls.airportOperationalInfo(request.airportId), request)
      : http.put<IAPIAirport>(apiUrls.updateAirportOperationalInfo(request.airportId, request.id), request);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => AirportOperationalInfoModel.deserialize(response)),
      tap(() =>
        AlertStore.info(`Airport Operational Information ${isNewRequest ? 'created' : 'updated'} successfully!`)
      )
    );
  }

  /* istanbul ignore next */
  public uploadAirportDiagram(file: File, airportId: string): Observable<AirportDiagramModel> {
    const data: FormData = new FormData();
    data.append('Diagram', file);
    data.append('AirportId', airportId);
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.post(apiUrls.upsertAirportDiagram, data).pipe(
      Logger.observableCatchError,
      map(response => AirportDiagramModel.deserialize({ id: 0, diagramUrl: response }))
    );
  }

  /* istanbul ignore next */
  public upsertAirportFlightPlanInfo(request: AirportFlightPlanInfoModel): Observable<AirportFlightPlanInfoModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIAirportFlightPlanInfoRequest> = isNewRequest
      ? http.post<IAPIAirportFlightPlanInfo>(apiUrls.airportFlightPlanInfo(request.airportId), request.serialize())
      : http.put<IAPIAirportFlightPlanInfo>(
        `${apiUrls.airportFlightPlanInfo(request.airportId)}/${request.id}`,
        request.serialize()
      );
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIAirportFlightPlanInfo) => AirportFlightPlanInfoModel.deserialize(response)),
      tap(() =>
        AlertStore.info(`Airport Flight Plan Information ${isNewRequest ? 'created' : 'updated'} successfully!`)
      )
    );
  }

  /* istanbul ignore next */
  @action
  public getFAAImportComparison(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<FAAImportComparisonModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      ...pageRequest,
    });

    return http
      .get<IAPIPageResponse<IAPIFAAImportComparison>>(`${`${apiUrls.FAAImportProcess}/FAAImportStaging`}?${params}`)
      .pipe(
        Logger.observableCatchError,
        map(response => ({ ...response, results: FAAImportComparisonModel.deserializeList(response.results) }))
      );
  }

  /* istanbul ignore next */
  public getFAAImportComparisonById(stagingId: string): Observable<FAAImportComparisonModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.get<IAPIPageResponse<IAPIFAAImportComparison>>(`${`${apiUrls.FAAImportStaging}/${stagingId}`}`).pipe(
      Logger.observableCatchError,
      map(response => FAAImportComparisonModel.deserialize(response))
    );
  }

  /* istanbul ignore next */
  public mergeAllFAARecords(
    processId: string,
    entityType: FAA_IMPORT_STAGING_ENTITY_TYPE
  ): Observable<IAPIFaaMergeResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http
      .post<string[]>(`${apiUrls.FAAMerge}/Schedule`, {
        processId,
        entityType,
      })
      .pipe(
        Logger.observableCatchError,
        tap(resp => {
          resp.hasErrors
            ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
            : AlertStore.info('MergeAll scheduled successfully');
        })
      );
  }

  /* istanbul ignore next */
  public mergeSelectedFaaRecord(
    fAAImportStaging: number[],
    processId: string,
    faaImportStagingEntityType: FAA_IMPORT_STAGING_ENTITY_TYPE
  ): Observable<IAPIFaaMergeResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http
      .put<string[]>(apiUrls.FAAMerge, {
        fAAImportStagingIds: fAAImportStaging,
        faaImportProcessId: processId,
        faaImportStagingEntityType,
      })
      .pipe(
        Logger.observableCatchError,
        tap(resp => {
          resp.hasErrors
            ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
            : AlertStore.info(`FAA Record${fAAImportStaging.length > 1 ? 's' : ''} merged successfully!`);
        })
      );
  }

  /* istanbul ignore next */
  public faaMergeStagingTables(request: IAPIMergeTableRequest): Observable<IAPIFaaMergeResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.put<string[]>(`${apiUrls.FAAMerge}/${request.faaImportStagingId}/Table`, request).pipe(
      Logger.observableCatchError,
      tap(resp => {
        resp.hasErrors
          ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
          : AlertStore.info('Records Merged successfully!');
      })
    );
  }

  /* istanbul ignore next */
  public faaMergeWithAssociatedRunways(request: IAPIFAAMergeByAirport): Observable<IAPIFaaMergeResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.put<string[]>(apiUrls.FAAMergeByAirport, request).pipe(
      Logger.observableCatchError,
      tap(resp => {
        resp.hasErrors
          ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
          : AlertStore.info('Records Merged successfully!');
      })
    );
  }

  /* istanbul ignore next */
  public updateFaaRecord(data: IAPIFaaImportStagingProperty[]): Observable<string[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.put<string[]>(apiUrls.FAAImportStaging, data).pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('FAA record updated successfully!'))
    );
  }

  /* istanbul ignore next */
  @action
  public getFAAImportProcess(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<FAAImportProcess>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'ProcessId', isAscending: false }]),
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIFAAImportProcess>>(`${apiUrls.FAAImportProcess}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: FAAImportProcess.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public getFAAImportProcessById(id: number): Observable<FAAImportProcess> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });

    return http.get<IAPIFAAImportProcess>(`${apiUrls.FAAImportProcess}/${id}`).pipe(
      Logger.observableCatchError,
      map(response => FAAImportProcess.deserialize(response))
    );
  }

  /* istanbul ignore next */
  public importFAAFile(file: File, faaImportFileType: number): Observable<IAPIFAAImportProcess> {
    const data: FormData = new FormData();
    data.append('file', file);
    data.append('FAAImportStatusId', '1');
    data.append('FAAImportFileType', faaImportFileType.toString());
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports, headers: { HasFile: true } });
    return http.post<IAPIFAAImportProcess>(apiUrls.FAAImportProcess, data).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: FAAImportComparisonModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public getCodeStatus(code: string): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    if (!code || code.length < 4) {
      return of(false);
    }

    return http.get(`${apiUrls.airports}/ValidateUWACodeForInactive?code=${code}`).pipe(Logger.observableCatchError);
  }

  /* istanbul ignore next */
  public loadAirportMappingsBeta(request?: IAPIGridRequest): Observable<IAPIPageResponse<AirportMappingsBetaModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const specifiedFields = [
      'AirportId',
      'AirportFlightPlanInfo.AirportFlightPlanInfoId',
      'AirportFlightPlanInfo.APGCode',
      'AirportFlightPlanInfo.NavBlueCode',
      'ICAOCode',
      'FAACode',
      'UWAAirportCode',
      'RegionalAirportCode',
    ];
    const params: string = Utilities.buildParamString({
      collectionName: NO_SQL_COLLECTIONS.Airports,
      ...request,
    });

    return http
      .get<IAPIPageResponse<IAPIAirportMappingsBeta>>(
        `${apiUrls.referenceData}?${params}${Utilities.getSpecifiedFieldParams(specifiedFields)}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => ({ ...response, results: AirportMappingsBetaModel.deserializeList(response.results) }))
      );
  }

  /* istanbul ignore next */
  public getRunways(airportId: number): Observable<AirportRunwayModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.get<IAPIAirportRunway[]>(`${apiUrls.runwayByAirport(airportId)}`).pipe(
      Logger.observableCatchError,
      map(response => AirportRunwayModel.deserializeList(response)),
      tapWithAction(response => (this.runways = response))
    );
  }

  /* istanbul ignore next */
  public getRunwayById(airportId: number, runwayId: number): Observable<AirportRunwayModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.get<AirportRunwayModel>(`${apiUrls.runwayByAirport(airportId)}/${runwayId}`).pipe(
      Logger.observableCatchError,
      map(response => AirportRunwayModel.deserialize(response))
    );
  }

  /* istanbul ignore next */
  @action
  public upsertRunway(airportId: number, request: AirportRunwayModel): Observable<AirportRunwayModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const isNewRequest: boolean = !Boolean(request.id);
    const upsertRequest: Observable<IAPIAirportRunway> = isNewRequest
      ? http.post<IAPIAirportRunway>(apiUrls.runwayByAirport(airportId), request.serialize())
      : http.put<IAPIAirportRunway>(
        `${apiUrls.runwayByAirport(airportId)}/${request.id}?id=${request.id}`,
        request.serialize()
      );

    return upsertRequest.pipe(
      map((response: IAPIAirportRunway) => AirportRunwayModel.deserialize(response)),
      tap(() => AlertStore.info(`Runway ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public upsertAssociatedRunway(request: AssociatedRunwayModel): Observable<AssociatedRunwayModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const isNewRequest: boolean = !Boolean(request.id);
    const upsertRequest: Observable<IAPIFrequencyRunway> = isNewRequest
      ? http.post(apiUrls.airportFrequencyRunway(request.airportFrequencyId), request.serialize())
      : http.put(`${apiUrls.airportFrequencyRunway(request.airportFrequencyId)}/${request.id}`, request.serialize());

    return upsertRequest.pipe(
      map((response: IAPIFrequencyRunway) => AssociatedRunwayModel.deserialize(response)),
      tap(() => AlertStore.info(`Runway ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public removeAssociatedRunway(request: IAPIFrequencyRunway): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.delete<string>(`${apiUrls.airportFrequencyRunway(request.airportFrequencyId)}/${request.id}`).pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Runway deleted successfully!'))
    );
  }

  /* istanbul ignore next */
  @action
  public upsertAirportFrequency(
    request: AirportFrequencyModel,
    airportRunways: AirportRunwayModel[]
  ): Observable<AirportFrequencyModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIAirportFrequency> = isNewRequest
      ? http.post<IAPIAirportFrequency>(apiUrls.airportFrequency, request.serialize())
      : http.put<IAPIAirportFrequency>(`${apiUrls.airportFrequency}/${request.id}`, request.serialize());

    return upsertRequest.pipe(
      map((response: IAPIAirportFrequency) => AirportFrequencyModel.deserialize(response, airportRunways)),
      tap(() => AlertStore.info(`Airport Frequency ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public removeAirportFrequency({ id }: AirportFrequencyModel): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http
      .delete<string>(apiUrls.airportFrequency, { airportFrequencyId: id })
      .pipe(
        Logger.observableCatchError,
        tap(() => AlertStore.info('Airport Frequency deleted successfully!'))
      );
  }

  /* istanbul ignore next */
  public uploadAgentProfile(file: File, airportId: string): Observable<AgentProfileModel> {
    const data: FormData = new FormData();
    data.append('AgentProfile', file);
    data.append('AirportId', airportId);
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.post(apiUrls.airportA2gAgentProfile, data).pipe(
      Logger.observableCatchError,
      map(response => AgentProfileModel.deserialize({ id: 0, profileUrl: response }))
    );
  }

  /* istanbul ignore next */
  public downloadRuralAirportData(processId: string): Observable<File> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.airports,
      responseType: 'blob',
    });
    return http.get(`${apiUrls.FAAImportProcess}/LogFile/${processId}`).pipe(Logger.observableCatchError);
  }

  /* istanbul ignore next */
  public getRunwayClosure(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<RunwayClosureModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      specifiedFields: 'RunwayClosures',
      collectionName: NO_SQL_COLLECTIONS.RUNWAY,
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIAirport>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({
        ...response,
        results: RunwayClosureModel.deserializeList(response.results[0]?.runwayClosures),
      }))
    );
  }

  /* istanbul ignore next */
  public getAirportRunwayClosure(
    pageRequest?: IAPIGridRequest
  ): Observable<IAPIPageResponse<AirportRunwayClosureModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      collectionName: NO_SQL_COLLECTIONS.RUNWAY,
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIAirport>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({
        ...response,
        results: AirportRunwayClosureModel.deserializeList(response.results),
      }))
    );
  }

  /* istanbul ignore next */
  public upsertAirportRunwayClosure(request: IAPIAirportRunwayClosure): Observable<RunwayClosureModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIAirportRunwayClosure> = isNewRequest
      ? http.post<IAPIAirportRunwayClosure>(apiUrls.runwayClosures(request.airportId, request.runwayId), request)
      : http.put<IAPIAirportRunwayClosure>(
        `${apiUrls.runwayClosures(request.airportId, request.runwayId)}/${request.id}`,
        request
      );
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => RunwayClosureModel.deserialize(response)),
      tap(() => AlertStore.info(`Airport Runway Closures ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public removeRunwayClosures(request: IAPIAirportRunwayClosure): Observable<string> {
    const params = {
      runwayClosuresId: request.id,
    };
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.delete<string>(apiUrls.runwayClosures(request.airportId, request.runwayId), params).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('Airport Runway Closures deleted successfully!'))
    );
  }

  /* istanbul ignore next */
  public getAirportSecurity(airportId: number): Observable<AirportSecurityModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.get<AirportSecurityModel>(apiUrls.airportSecurity(airportId)).pipe(
      Logger.observableCatchError,
      map(response => AirportSecurityModel.deserialize(response))
    );
  }

  /* istanbul ignore next */
  public upsertAirportSecurity(request: IAPIAirportSecurityRequest): Observable<AirportSecurityModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIAirportSecurityRequest> = isNewRequest
      ? http.post<IAPIAirportSecurityRequest>(apiUrls.airportSecurity(request.airportId), request)
      : http.put<IAPIAirportSecurityRequest>(`${apiUrls.airportSecurity(request.airportId)}/${request.id}`, request);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => AirportSecurityModel.deserialize(response)),
      tap(() => AlertStore.info(`Airport Security ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  @action
  public getAirportHoursReview(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<AirportHourReviewModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIAirportHourReview>>(`${apiUrls.airportHourStaging}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: AirportHourReviewModel.deserializeList(response.results) }))
    );
  }

  public getAirportHoursReviewList(
    rowIndex?: number
  ): Observable<IAPIPageResponse<AirportHourUplinkStagingReviewModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http
      .get<IAPIPageResponse<IAPIUplinkAirportHourReview>>(
        `${apiUrls.airportHourStaging}/UplinkPropertyList/${rowIndex}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => ({ ...response, results: AirportHourUplinkStagingReviewModel.deserializeList(response) }))
      );
  }

  /* istanbul ignore next */
  public approveAirportHourStaging(request): Observable<IAPIFaaMergeResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.put<string[]>(`${apiUrls.airportHourStaging}/Approve/${request.uplinkStagingId}`, request).pipe(
      Logger.observableCatchError,
      tap(resp => {
        resp.hasErrors
          ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
          : AlertStore.info('Records Approved successfully!');
      })
    );
  }

  /* istanbul ignore next */
  public rejectAirportHourStaging(request): Observable<IAPIFaaMergeResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.put<string[]>(`${apiUrls.airportHourStaging}/Reject/${request.uplinkStagingId}`, request).pipe(
      Logger.observableCatchError,
      tap(resp => {
        resp.hasErrors
          ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
          : AlertStore.info('Records Rejected successfully!');
      })
    );
  }

  public getAirportParkingReview(
    pageRequest?: IAPIGridRequest
  ): Observable<IAPIPageResponse<AirportParkingReviewModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      ...pageRequest,
    });
    return http
      .get<IAPIPageResponse<IAPIUplinkAirportParkingReview>>(`${apiUrls.airportParkingUplinkStaging}?${params}`)
      .pipe(
        Logger.observableCatchError,
        map(response => ({ ...response, results: AirportParkingReviewModel.deserializeList(response.results) }))
      );
  }

  public getAirportParkingReviewList(rowIndex?: number): Observable<AirportParkingReviewModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http
      .get<IAPIPageResponse<IAPIUplinkAirportParkingReview>>(
        `${apiUrls.airportParkingUplinkStaging}/AirportParkingStagingPropertyList/${rowIndex}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => AirportParkingReviewModel.deserialize(response))
      );
  }

  /* istanbul ignore next */
  public approveAirportParkingStaging(request): Observable<IAPIFaaMergeResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http
      .put<string[]>(`${apiUrls.airportParkingUplinkStaging}/Approve/${request.uplinkStagingId}`, request)
      .pipe(
        Logger.observableCatchError,
        tap(resp => {
          resp.hasErrors
            ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
            : AlertStore.info('Records Approved successfully!');
        })
      );
  }

  /* istanbul ignore next */
  public rejectAirportParkingStaging(request): Observable<IAPIFaaMergeResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.put<string[]>(`${apiUrls.airportParkingUplinkStaging}/Reject/${request.uplinkStagingId}`, request).pipe(
      Logger.observableCatchError,
      tap(resp => {
        resp.hasErrors
          ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
          : AlertStore.info('Records Rejected successfully!');
      })
    );
  }

  /* istanbul ignore next */
  public getMilitaryUplinkStagings(
    pageRequest?: IAPIGridRequest
  ): Observable<IAPIPageResponse<MilitaryFieldsReviewModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIMilitaryUplinkStaging>>(`${apiUrls.militaryUplinkStaging}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: MilitaryFieldsReviewModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public getMilitaryStagingDetail(propertyId?: number): Observable<IAPIMilitaryReviewDetail> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http
      .get<IAPIMilitaryReviewDetail>(
        `${apiUrls.militaryUplinkStaging}/AirportMilitaryStagingPropertyList/${propertyId}`
      )
      .pipe(Logger.observableCatchError);
  }

  /* istanbul ignore next */
  public approveRejectMilitaryStaging(uplinkStagingId, isApproved): Observable<IAPIUplinkResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const action = isApproved ? 'Approve' : 'Reject';
    return http
      .put<string[]>(`${apiUrls.militaryUplinkStaging}/${action}/${uplinkStagingId}`, { uplinkStagingId })
      .pipe(
        Logger.observableCatchError,
        tap(resp => {
          resp.hasErrors
            ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
            : AlertStore.info(`Records ${isApproved ? 'Approved' : 'Rejected'} successfully!`);
        })
      );
  }

  /* istanbul ignore next */
  public getAirportPermissions(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<AirportPermissionModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_PERMISSION,
      sortCollection: JSON.stringify([{ propertyName: 'PermissionType.Name', isAscending: true }]),
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIAirport>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: AirportPermissionModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public upsertAirportPermission(permission: IAPIAirportPermissionRequest): Observable<AirportPermissionModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const isNewRequest: boolean = permission.id === 0;
    const upsertRequest: Observable<IAPIAirportPermissionRequest> = isNewRequest
      ? http.post<IAPIAirportPermissionRequest>(apiUrls.airportPermission(permission.airportId), permission)
      : http.put<IAPIAirportPermissionRequest>(
        `${apiUrls.airportPermission(permission.airportId)}/${permission.id}`,
        permission
      );

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => AirportPermissionModel.deserialize(response)),
      tap(() => AlertStore.info(`Airport Permission ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public getAirportDataExports(request?: IAPIGridRequest): Observable<IAPIPageResponse<AirportDataExportModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      sortCollection: JSON.stringify([{ propertyName: 'Id', isAscending: false }]),
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIAirportDataExport>>(`${apiUrls.airportDataExportRequest}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: AirportDataExportModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public upsertAirportDataExport(request: IAPIAirportDataExportRequest): Observable<AirportDataExportModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const upsertRequest: Observable<IAPIAirportDataExportRequest> = http.post<IAPIAirportDataExportRequest>(
      apiUrls.airportDataExportRequest,
      request
    );
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIAirportDataExport) => AirportDataExportModel.deserialize(response)),
      tap(() => AlertStore.info('Report Types added successfully!'))
    );
  }

  /* istanbul ignore next */
  public downloadAirportDataExportFile(recordId: number): Observable<File> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.airports,
      responseType: 'blob',
    });
    return http.get(`${apiUrls.airportDataExportRequest}/downloadfile/${recordId}`).pipe(Logger.observableCatchError);
  }
}
