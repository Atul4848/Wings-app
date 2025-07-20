import {
  baseApiPath,
  CountryModel,
  HttpClient,
  IAPICountry,
  NO_SQL_COLLECTIONS,
  SettingsBaseStore,
  StateModel,
  AirportModel,
} from '@wings/shared';
import { action, observable } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  IAPIAirport,
  IApiHealthAuth,
  IAPIEntryRequirement,
  IAPIExitRequirement,
  IAPIQuarantineRequirement,
  IAPIStayRequirement,
  IAPIHealthAuthorizationOverview,
} from '../Interfaces';
import {
  GeneralInfoModel,
  HealthAuthModel,
  HealthAuthorizationChangeRecordModel,
  EntryRequirementModel,
  ExitRequirementModel,
  QuarantineRequirementModel,
  VaccinationRequirementModel,
  StayRequirementModel,
  DomesticMeasureModel,
  HealthAuthorizationOverviewModel,
  TraveledHistoryModel,
} from '../Models';
import { apiUrls } from './API.url';
import { AlertStore } from '@uvgo-shared/alert';
import { Field } from 'mobx-react-form';
import { Logger } from '@wings-shared/security';
import {
  IAPIGridRequest,
  IAPIPageResponse,
  IBaseApiResponse,
  SEARCH_ENTITY_TYPE,
  Utilities,
  baseEntitySearchFilters,
  tapWithAction,
  IdNameCodeModel,
  SettingsTypeModel,
} from '@wings-shared/core';

export class HealthAuthStore extends SettingsBaseStore {
  @observable public authorizationLevels: SettingsTypeModel[] = [];
  @observable public affectedTypes: SettingsTypeModel[] = [];
  @observable public infectionTypes: SettingsTypeModel[] = [];
  @observable public quarantineLocations: IdNameCodeModel[] = [];
  @observable public wingsAirports: AirportModel[] = [];
  @observable public countries: CountryModel[] = [];
  @observable public states: StateModel[] = [];
  @observable public healthAuths: HealthAuthModel[] = [];
  @observable public regions: SettingsTypeModel[] = [];
  @observable public selectedHealthAuth: HealthAuthModel = new HealthAuthModel();
  @observable public selectedGeneralInfoField: Field;

  constructor() {
    super(baseApiPath.restrictions);
  }

  /* istanbul ignore next */
  @action
  public setSelectedGeneralInfoField(field: Field): void {
    this.selectedGeneralInfoField = field;
  }

  @action
  public setSelectedHealthAuthorization(healthAuthorization: Partial<HealthAuthModel>): void {
    this.selectedHealthAuth = new HealthAuthModel(healthAuthorization);
  }

  /* istanbul ignore next */
  public getHealthAuths(forceRefresh?: boolean): Observable<IAPIPageResponse<HealthAuthModel>> {
    const specifiedFields = [
      'AuthorizationLevel',
      'AffectedType',
      'HealthAuthorizationId',
      'InfectionType',
      'IsAllNationalities',
      'IsAllTraveledCountries',
      'HealthAuthorizationNationalities',
      'HealthAuthorizationTraveledCountries',
      'ReceivedDate',
      'ModifiedOn',
      'RequestedDate',
      'IsSuspendNotification',
      'Status',
    ];
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const sortCollection = [{ propertyName: 'AuthorizationLevel.Name', isAscending: true }];
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.HEALTH_AUTHORIZATION,
      sortCollection: JSON.stringify(sortCollection),
      version: 'v2',
    });

    if (this.healthAuths?.length && !forceRefresh) {
      return of({ results: this.healthAuths, pageNumber: 1, pageSize: 10, totalNumberOfRecords: 10 });
    }
    return http
      .get<IAPIPageResponse<IApiHealthAuth>>(
        `${apiUrls.referenceData}?${params}${Utilities.getSpecifiedFieldParams(specifiedFields)}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => ({ ...response, results: HealthAuthModel.deserializeList(response.results) })),
        tapWithAction(response => (this.healthAuths = response.results))
      );
  }

  /* istanbul ignore next */
  public getHealthAuthById(request?: IAPIGridRequest): Observable<IAPIPageResponse<HealthAuthModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      collectionName: NO_SQL_COLLECTIONS.HEALTH_AUTHORIZATION,
      version: 'v2',
      ...request,
    });
    return http.get<IAPIPageResponse<IApiHealthAuth>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: HealthAuthModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  @action
  public upsertHealthAuth(request: HealthAuthorizationOverviewModel): Observable<HealthAuthorizationOverviewModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.restrictions });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIHealthAuthorizationOverview> = isNewRequest
      ? http.post<IAPIHealthAuthorizationOverview>(apiUrls.healthAuth, request.serialize())
      : http.put<IAPIHealthAuthorizationOverview>(`${apiUrls.healthAuth}/${request.id}`, request.serialize());

    return upsertRequest.pipe(
      map((response: IAPIHealthAuthorizationOverview) => HealthAuthorizationOverviewModel.deserialize(response)),
      tap(() => AlertStore.info(`Health Authorization ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  @action
  public upsertHealthAuthClone(request: HealthAuthorizationOverviewModel): Observable<HealthAuthModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.restrictions });
    const upsertRequest = http.post<IApiHealthAuth>(apiUrls.healthAuthorizationClone, request.serialize());
    return upsertRequest.pipe(
      map((response: IApiHealthAuth) => HealthAuthModel.deserialize(response)),
      tap(() => AlertStore.info('Health Authorization created successfully!'))
    );
  }

  /* istanbul ignore next */
  public getAffectedTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.affectedType,
      this.affectedTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(affectedTypes => (this.affectedTypes = affectedTypes)));
  }

  /* istanbul ignore next */
  public upsertAffectedType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.affectedType, 'Affected Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((affectedType: SettingsTypeModel) => {
        this.affectedTypes = Utilities.updateArray<SettingsTypeModel>(this.affectedTypes, affectedType, {
          replace: !isAddRequest,
          predicate: t => t.id === affectedType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getAuthorizationLevels(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.authorizationLevel,
      this.authorizationLevels,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(authorizationLevels => (this.authorizationLevels = authorizationLevels)));
  }

  /* istanbul ignore next */
  public upsertAuthorizationLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.authorizationLevel, 'Authorization Level').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((authorizationLevel: SettingsTypeModel) => {
        this.authorizationLevels = Utilities.updateArray<SettingsTypeModel>(
          this.authorizationLevels,
          authorizationLevel,
          {
            replace: !isAddRequest,
            predicate: t => t.id === authorizationLevel.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getInfectionTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.infectionType,
      this.infectionTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(infectionTypes => (this.infectionTypes = infectionTypes)));
  }

  /* istanbul ignore next */
  public upsertInfectionType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.infectionType, 'Infection Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((infectionType: SettingsTypeModel) => {
        this.infectionTypes = Utilities.updateArray<SettingsTypeModel>(this.infectionTypes, infectionType, {
          replace: !isAddRequest,
          predicate: t => t.id === infectionType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getQuarantineLocations(forceRefresh: boolean = false): Observable<IdNameCodeModel[]> {
    return this.getResult(
      apiUrls.quarantineLocation,
      this.quarantineLocations,
      forceRefresh,
      IdNameCodeModel.deserializeList
    ).pipe(tapWithAction((quarantineLocations: IdNameCodeModel[]) => (this.quarantineLocations = quarantineLocations)));
  }

  /* istanbul ignore next */
  public upsertQuarantineLocation(request: IdNameCodeModel): Observable<IdNameCodeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.quarantineLocation, 'Quarantine Location').pipe(
      map(response => IdNameCodeModel.deserialize(response)),
      tapWithAction((quarantineLocation: IdNameCodeModel) => {
        this.quarantineLocations = Utilities.updateArray<IdNameCodeModel>(
          this.quarantineLocations,
          quarantineLocation,
          {
            replace: !isAddRequest,
            predicate: t => t.id === quarantineLocation.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getCountries(request?: IAPIGridRequest, forceRefresh?: boolean): Observable<CountryModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.COUNTRY,
      sortCollection: JSON.stringify([{ propertyName: 'CommonName', isAscending: true }]),
      ...request,
    });
    if (this.countries?.length && !forceRefresh) {
      return of(this.countries);
    }
    return http.get<IAPIPageResponse<IAPICountry>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => CountryModel.deserializeList(response.results)),
      tapWithAction(response => (this.countries = response))
    );
  }
  /* istanbul ignore next */
  public getRegions(): Observable<SettingsTypeModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.REGION,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
      specifiedFields: baseEntitySearchFilters[SEARCH_ENTITY_TYPE.REGION].specifiedFields,
    });
    return http.get<IAPIPageResponse<IBaseApiResponse>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(({ results }) => results.map(x => SettingsTypeModel.deserialize({ ...x, id: x.regionId }))),
      tapWithAction(response => (this.regions = response))
    );
  }

  /* istanbul ignore next */
  public getStates(request?: IAPIGridRequest, forceRefresh?: boolean): Observable<StateModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.STATE,
      sortCollection: JSON.stringify([{ propertyName: 'CommonName', isAscending: true }]),
      ...request,
    });
    if (this.states?.length && !forceRefresh) {
      return of(this.states);
    }
    return http.get<IAPIPageResponse<IAPICountry>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => StateModel.deserializeList(response.results)),
      tapWithAction(response => (this.states = response))
    );
  }

  /* istanbul ignore next */
  public getWingsAirport(searchValue: string): Observable<AirportModel[]> {
    const filter = Utilities.getFilter('Status.Name', 'Active', 'and');
    const request: IAPIGridRequest = {
      pageSize: 50,
      searchCollection: searchValue
        ? JSON.stringify([
          Utilities.getFilter('ICAOCode.Code', searchValue),
          Utilities.getFilter('UWACode', searchValue, 'or'),
          Utilities.getFilter('IATACode', searchValue, 'or'),
        ])
        : '',
      filterCollection: JSON.stringify([ filter ]),
      specifiedFields: [ 'AirportId', 'ICAOCode', 'UWACode', 'IATACode', 'RegionalCode', 'DisplayCode' ],
    };

    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.Airports,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIAirport>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => AirportModel.deserializeList(response.results)),
      tapWithAction(response => (this.wingsAirports = response))
    );
  }

  /* istanbul ignore next */
  public validateUnique(request: HealthAuthorizationOverviewModel): Observable<{ isValid: boolean }> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.restrictions });
    return http.post(apiUrls.healthAuthValidateUnique, request.serialize());
  }

  /* istanbul ignore next */
  @action
  public upsertGeneralInformation(request: HealthAuthModel): Observable<GeneralInfoModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.restrictions });
    const { id, generalInformation, accessLevelId, sourceTypeId, statusId } = request;
    const upsertRequest: Observable<IApiHealthAuth> = http.put<IApiHealthAuth>(apiUrls.generalInformation(id), {
      accessLevelId,
      sourceTypeId,
      statusId,
      generalInformation: generalInformation.serialize(),
    });
    return upsertRequest.pipe(
      map((response: IApiHealthAuth) => {
        const result = GeneralInfoModel.deserialize(response.generalInformation);
        this.setSelectedHealthAuthorization({
          ...this.selectedHealthAuth,
          modifiedOn: response.modifiedOn,
          modifiedBy: response.modifiedBy,
          generalInformation: result,
        });
        return result;
      }),
      tap(() => AlertStore.info('General Information updated successfully!'))
    );
  }

  /* istanbul ignore next */
  @action
  public upsertStayRequirement(request: HealthAuthModel): Observable<StayRequirementModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.restrictions });
    const { id, crewStayRequirement, passengerStayRequirement, sourceTypeId, statusId, accessLevelId } = request;
    const stayRequirements: IAPIStayRequirement[] = [
      crewStayRequirement.serialize(),
      passengerStayRequirement.serialize(),
    ];
    const upsertRequest: Observable<IApiHealthAuth> = http.put<IApiHealthAuth>(
      apiUrls.stayRequirement(id),

      { sourceTypeId, statusId, accessLevelId, stayRequirements }
    );
    return upsertRequest.pipe(
      map((response: IApiHealthAuth) => {
        const result = StayRequirementModel.deserializeList(response?.stayRequirements);
        this.setSelectedHealthAuthorization({
          ...this.selectedHealthAuth,
          modifiedOn: response.modifiedOn,
          modifiedBy: response.modifiedBy,
          crewStayRequirement:
            result.find(x => Utilities.isEqual(x.paxCrew?.id, 2)) || new StayRequirementModel({ paxCrewId: 2 }),
          passengerStayRequirement:
            result?.find(x => Utilities.isEqual(x.paxCrew?.id, 1)) || new StayRequirementModel({ paxCrewId: 1 }),
        });
        return result;
      }),
      tap(() => AlertStore.info('Stay Requirement updated successfully!'))
    );
  }

  /* istanbul ignore next */
  public upsertEntryRequirement(request: HealthAuthModel): Observable<EntryRequirementModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.restrictions });
    const { id, crewEntryRequirement, passengerEntryRequirement, sourceTypeId, statusId, accessLevelId } = request;
    const entryRequirements: IAPIEntryRequirement[] = [
      crewEntryRequirement.serialize(),
      passengerEntryRequirement.serialize(),
    ];
    const upsertRequest: Observable<IApiHealthAuth> = http.put<IApiHealthAuth>(apiUrls.entryRequirement(id), {
      sourceTypeId,
      statusId,
      accessLevelId,
      entryRequirements,
    });
    return upsertRequest.pipe(
      map((response: IApiHealthAuth) => {
        const result = EntryRequirementModel.deserializeList(response.entryRequirements);
        this.setSelectedHealthAuthorization({
          ...this.selectedHealthAuth,
          modifiedOn: response.modifiedOn,
          modifiedBy: response.modifiedBy,
          crewEntryRequirement:
            result.find(x => Utilities.isEqual(x.paxCrew?.id, 2)) || new EntryRequirementModel({ paxCrewId: 2 }),
          passengerEntryRequirement:
            result?.find(x => Utilities.isEqual(x.paxCrew?.id, 1)) || new EntryRequirementModel({ paxCrewId: 1 }),
        });
        return result;
      }),
      tap(() => AlertStore.info('Entry Requirement updated successfully!'))
    );
  }

  /* istanbul ignore next */
  public upsertDomesticMeasure(request: HealthAuthModel): Observable<DomesticMeasureModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.restrictions });
    const { id, sourceTypeId, statusId, accessLevelId, domesticMeasure } = request;

    const upsertRequest: Observable<IApiHealthAuth> = http.put<IApiHealthAuth>(apiUrls.domesticMeasure(id), {
      sourceTypeId,
      statusId,
      accessLevelId,
      domesticMeasure: domesticMeasure.serialize(),
    });
    return upsertRequest.pipe(
      map((response: IApiHealthAuth) => {
        const result = DomesticMeasureModel.deserialize(response.domesticMeasure);
        this.setSelectedHealthAuthorization({
          ...this.selectedHealthAuth,
          modifiedOn: response.modifiedOn,
          modifiedBy: response.modifiedBy,
          domesticMeasure: new DomesticMeasureModel(result),
        });
        return result;
      }),
      tap(() => AlertStore.info('Domestic measure updated successfully!'))
    );
  }

  /* istanbul ignore next */
  @action
  public upsertExitRequirement(request: HealthAuthModel): Observable<ExitRequirementModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.restrictions });
    const { id, crewExitRequirement, passengerExitRequirement, sourceTypeId, statusId, accessLevelId } = request;
    const exitRequirements: IAPIExitRequirement[] = [
      crewExitRequirement.serialize(),
      passengerExitRequirement.serialize(),
    ];
    const upsertRequest: Observable<IApiHealthAuth> = http.put<IApiHealthAuth>(apiUrls.exitRequirement(id), {
      sourceTypeId,
      statusId,
      accessLevelId,
      exitRequirements,
    });
    return upsertRequest.pipe(
      map((response: IApiHealthAuth) => {
        const result = ExitRequirementModel.deserializeList(response.exitRequirements);
        this.setSelectedHealthAuthorization({
          ...this.selectedHealthAuth,
          modifiedOn: response.modifiedOn,
          modifiedBy: response.modifiedBy,
          crewExitRequirement:
            result.find(x => Utilities.isEqual(x.paxCrew?.id, 2)) || new ExitRequirementModel({ paxCrewId: 2 }),
          passengerExitRequirement:
            result?.find(x => Utilities.isEqual(x.paxCrew?.id, 1)) || new ExitRequirementModel({ paxCrewId: 1 }),
        });
        return result;
      }),
      tap(() => AlertStore.info('Exit Requirement updated successfully!'))
    );
  }

  /* istanbul ignore next */
  @action
  public upsertVaccinationRequirement(request: HealthAuthModel): Observable<VaccinationRequirementModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.restrictions });
    const {
      id,
      crewVaccinationRequirement,
      passengerVaccinationRequirement,
      sourceTypeId,
      statusId,
      accessLevelId,
    } = request;
    const vaccinationRequirements = [
      crewVaccinationRequirement.serialize(),
      passengerVaccinationRequirement.serialize(),
    ];
    const upsertRequest: Observable<IApiHealthAuth> = http.put<IApiHealthAuth>(apiUrls.vaccinationRequirement(id), {
      sourceTypeId,
      statusId,
      accessLevelId,
      vaccinationRequirements,
    });
    return upsertRequest.pipe(
      map((response: IApiHealthAuth) => {
        const result = VaccinationRequirementModel.deserializeList(response.vaccinationRequirements);
        this.setSelectedHealthAuthorization({
          ...this.selectedHealthAuth,
          modifiedOn: response.modifiedOn,
          modifiedBy: response.modifiedBy,
          crewVaccinationRequirement: new VaccinationRequirementModel(
            result.find(x => Utilities.isEqual(x.paxCrew.id, 2))
          ),
          passengerVaccinationRequirement: new VaccinationRequirementModel(
            result.find(x => Utilities.isEqual(x.paxCrew.id, 1))
          ),
        });
        return result;
      }),
      tap(() => AlertStore.info('Vaccination Requirement updated successfully!'))
    );
  }

  /* istanbul ignore next */
  @action
  public upsertChangeRecords(request: HealthAuthModel): Observable<HealthAuthorizationChangeRecordModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.restrictions });
    const { id, healthAuthorizationChangeRecords, sourceTypeId, statusId, accessLevelId } = request;
    const upsertRequest: Observable<IApiHealthAuth> = http.put<IApiHealthAuth>(apiUrls.changeRecord(id), {
      sourceTypeId,
      statusId,
      accessLevelId,
      healthAuthorizationChangeRecords: healthAuthorizationChangeRecords?.map(a => a.serialize()),
    });
    return upsertRequest.pipe(
      map((response: IApiHealthAuth) => {
        const result = HealthAuthorizationChangeRecordModel.deserializeList(
          response?.healthAuthorizationChangeRecords as HealthAuthorizationChangeRecordModel[]
        );
        this.setSelectedHealthAuthorization({
          ...this.selectedHealthAuth,
          modifiedOn: response?.modifiedOn,
          modifiedBy: response?.modifiedBy,
          healthAuthorizationChangeRecords: result,
        });
        return result;
      }),
      tap(() => AlertStore.info('Change records updated successfully!'))
    );
  }

  /* istanbul ignore next */
  @action
  public upsertQuarantineRequirement(request: HealthAuthModel): Observable<QuarantineRequirementModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.restrictions });
    const {
      id,
      crewQuarantineRequirement,
      passengerQuarantineRequirement,
      sourceTypeId,
      statusId,
      accessLevelId,
    } = request;
    const quarantineRequirements: IAPIQuarantineRequirement[] = [
      crewQuarantineRequirement.serialize(),
      passengerQuarantineRequirement.serialize(),
    ];
    const upsertRequest: Observable<IApiHealthAuth> = http.put<IApiHealthAuth>(apiUrls.quarantineRequirement(id), {
      sourceTypeId,
      statusId,
      accessLevelId,
      quarantineRequirements,
    });
    return upsertRequest.pipe(
      map((response: IApiHealthAuth) => {
        const result = QuarantineRequirementModel.deserializeList(response.quarantineRequirements);
        this.setSelectedHealthAuthorization({
          ...this.selectedHealthAuth,
          modifiedOn: response.modifiedOn,
          modifiedBy: response.modifiedBy,
          crewQuarantineRequirement: new QuarantineRequirementModel({
            ...result.find(x => x.paxCrew.id === 2),
            healthAuthorizationId: this.selectedHealthAuth.id,
            paxCrew: new SettingsTypeModel({ id: 2 }),
          }),
          passengerQuarantineRequirement: new QuarantineRequirementModel({
            ...result.find(x => x.paxCrew.id === 1),
            healthAuthorizationId: this.selectedHealthAuth.id,
            paxCrew: new SettingsTypeModel({ id: 1 }),
          }),
        });
        return result;
      }),
      tap(() => AlertStore.info('Quarantine Requirement updated successfully!'))
    );
  }

  /* istanbul ignore next */
  public getHealthAuthExcelFile(): Observable<File> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.restrictions,
      responseType: 'blob',
    });
    const params: string = Utilities.buildParamString({ pageSize: 0 });
    return http.get(`${apiUrls.healthAuthExcel}?${params}`).pipe(Logger.observableCatchError);
  }

  /* istanbul ignore next */
  @action
  public upsertTraveledHistory(request: HealthAuthModel): Observable<TraveledHistoryModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.restrictions });
    const { id, traveledHistory, sourceTypeId, statusId, accessLevelId } = request;
    const upsertRequest: Observable<IApiHealthAuth> = http.put<IApiHealthAuth>(apiUrls.traveledHistory(id), {
      sourceTypeId,
      statusId,
      accessLevelId,
      traveledHistory: traveledHistory.serialize(),
    });
    return upsertRequest.pipe(
      map((response: IApiHealthAuth) => {
        const result = TraveledHistoryModel.deserialize(response.traveledHistory);
        this.setSelectedHealthAuthorization({
          ...this.selectedHealthAuth,
          modifiedOn: response.modifiedOn,
          modifiedBy: response.modifiedBy,
          traveledHistory: result,
        });
        return result;
      }),
      tap(() => AlertStore.info('Traveled History updated successfully!'))
    );
  }
}
