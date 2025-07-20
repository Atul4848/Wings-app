import {
  baseApiPath,
  SettingsBaseStore,
  NO_SQL_COLLECTIONS,
  HttpClient,
  AirportModel,
  IAPIAirport,
} from '@wings/shared';
import { apiUrls } from './ApiUrls';
import { forkJoin, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { observable } from 'mobx';
import { AirportHoursSubTypeModel, IAPIAirportHoursSubTypes } from '../../Shared';
import {
  AirportHoursBufferModel,
  AirportHourRemarksModel,
  AirportHoursTypeModel,
  ConditionalOperatorModel,
  ConditionTypeModel,
  ICAOCodeModel,
  MilitaryUseTypeModel,
  RunwaySettingsTypeModel,
  AirportCodeSettingsModel,
  AirportCategoryModel,
  RunwaySurfaceTypeModel,
  RunwayLightTypeModel,
  ConditionTypeConfigModel,
  NoteTypeModel,
  ExceptionEntityParameterConfigModel,
} from '../Models';
import {
  IAPIAirportFacility,
  IAPIAirportHoursRemarks,
  IAPIAirportUsage,
  IAPIConditionalOperator,
  IAPIConditionType,
  IAPIAirportType,
  IAPIDistanceUOM,
  IAPIAirportDirection,
  IAPIAirportFacilityAccessLevel,
  IAPIICAOCode,
  IAPIMilitaryUseType,
  IAPIAirportHoursBuffer,
  IAPIRunwaySurfaceType,
  IAPIRunwayCondition,
  IAPIRunwaySurfaceTreatment,
  IAPIRunwayLightType,
  IAPIRunwayRVR,
  IAPIRunwayApproachLight,
  IAPIRunwayVGSI,
  IAPIAirportDataSource,
  IAPICodeSettings,
  IAPIAirportCategory,
  IAPIRunwayNavaids,
  IAPIRunwayApproachTypeId,
  IAPIRunwayUsageType,
  IAPIFrequencyType,
  IAPISector,
  IAPIConditionTypeConfig,
} from '../Interfaces';
import {
  IAPIGridRequest,
  IAPIPageResponse,
  SEARCH_ENTITY_TYPE,
  Utilities,
  baseEntitySearchFilters,
  tapWithAction,
  IdNameCodeModel,
  SettingsTypeModel,
  IDCodeModel,
  IAPIIdNameCode,
} from '@wings-shared/core';
import { Logger } from '@wings-shared/security';
import { AlertStore } from '@uvgo-shared/alert';

export class AirportSettingsStore extends SettingsBaseStore {
  @observable public airportHourTypes: AirportHoursTypeModel[] = [];
  @observable public airportHourSubTypes: AirportHoursSubTypeModel[] = [];
  @observable public airportHoursRemarks: AirportHourRemarksModel[] = [];
  @observable public conditionTypes: ConditionTypeModel[] = [];
  @observable public conditionalOperators: ConditionalOperatorModel[] = [];
  @observable public stddstTypes: SettingsTypeModel[] = [];
  @observable public scheduleTypes: SettingsTypeModel[] = [];
  @observable public airportTypes: SettingsTypeModel[] = [];
  @observable public airportFacilityTypes: SettingsTypeModel[] = [];
  @observable public distanceUOMs: SettingsTypeModel[] = [];
  @observable public airportDirections: SettingsTypeModel[] = [];
  @observable public airportUsageTypes: SettingsTypeModel[] = [];
  @observable public airportFacilityAccessLevels: SettingsTypeModel[] = [];
  @observable public ICAOCodes: ICAOCodeModel[] = [];
  @observable public airportHourBuffers: AirportHoursBufferModel[] = [];
  @observable public runwaySurfaceTypes: RunwaySurfaceTypeModel[] = [];
  @observable public runwayConditions: RunwaySettingsTypeModel[] = [];
  @observable public runwaySurfaceTreatments: RunwaySettingsTypeModel[] = [];
  @observable public runwayLightTypes: RunwayLightTypeModel[] = [];
  @observable public runwayRVR: RunwaySettingsTypeModel[] = [];
  @observable public runwayApproachLight: RunwaySettingsTypeModel[] = [];
  @observable public runwayVGSI: RunwaySettingsTypeModel[] = [];
  @observable public airportDataSources: SettingsTypeModel[] = [];
  @observable public rejectionReason: SettingsTypeModel[] = [];
  @observable public weatherReportingSystem: AirportCodeSettingsModel[] = [];
  @observable public airportClassCode: AirportCodeSettingsModel[] = [];
  @observable public airportCertificateCode: AirportCodeSettingsModel[] = [];
  @observable public airportServiceCode: AirportCodeSettingsModel[] = [];
  @observable public airportCategory: AirportCategoryModel[] = [];
  @observable public runwayNavaids: RunwaySettingsTypeModel[] = [];
  @observable public runwayApproachType: RunwaySettingsTypeModel[] = [];
  @observable public runwayUsageTypes: SettingsTypeModel[] = [];
  @observable public airportOfEntry: IdNameCodeModel[] = [];
  @observable public militaryUseType: MilitaryUseTypeModel[] = [];
  @observable public frequencyTypes: SettingsTypeModel[] = [];
  @observable public sectors: SettingsTypeModel[] = [];
  @observable public fuelTypes: SettingsTypeModel[] = [];
  @observable public oilTypes: SettingsTypeModel[] = [];
  @observable public areaPortAssignments: SettingsTypeModel[] = [];
  @observable public requiredInformationTypes: SettingsTypeModel[] = [];
  @observable public fieldOfficeOversights: SettingsTypeModel[] = [];
  @observable public customsLocationInformation: SettingsTypeModel[] = [];
  @observable public maxPOBOptions: SettingsTypeModel[] = [];
  @observable public cbpPortTypes: SettingsTypeModel[] = [];
  @observable public visaTimings: SettingsTypeModel[] = [];
  @observable public uwaCodes: AirportCodeSettingsModel[] = [];
  @observable public regionalCodes: AirportCodeSettingsModel[] = [];
  @observable public rampSideAccess: SettingsTypeModel[] = [];
  @observable public rampSideAccess3rdPartyVendors: SettingsTypeModel[] = [];
  @observable public rampSideAccess3rdParty: SettingsTypeModel[] = [];
  @observable public securityMeasures: SettingsTypeModel[] = [];
  @observable public recommendedServices: SettingsTypeModel[] = [];
  @observable public destinationAlternateTOFs: IdNameCodeModel[] = [];
  @observable public overtime: SettingsTypeModel[] = [];
  @observable public segmentType: SettingsTypeModel[] = [];
  @observable public flightType: IDCodeModel[] = [];
  @observable public conditionTypeConfig: ConditionTypeConfigModel[] = [];
  @observable public noiseClassifications: SettingsTypeModel[] = [];
  @observable public leadTimeType: SettingsTypeModel[] = [];
  @observable public largeAircraftRestriction: SettingsTypeModel[] = [];
  @observable public customsContactTypes: SettingsTypeModel[] = [];
  @observable public customsContactAddressTypes: SettingsTypeModel[] = [];
  @observable public overnightParkings: SettingsTypeModel[] = [];
  @observable public noteTypes: NoteTypeModel[] = [];
  @observable public permissionTypes: SettingsTypeModel[] = [];
  @observable public requiredFor: SettingsTypeModel[] = [];
  @observable public confirmationRequiredFor: SettingsTypeModel[] = [];
  @observable public exceptionRequirements: SettingsTypeModel[] = [];
  @observable public notificationTypes: SettingsTypeModel[] = [];
  @observable public requestFormats: SettingsTypeModel[] = [];
  @observable public requestAddressTypes: SettingsTypeModel[] = [];
  @observable public pprPurpose: SettingsTypeModel[] = [];
  @observable public reportTypes: SettingsTypeModel[] = [];
  @observable public requestStatus: SettingsTypeModel[] = [];
  @observable public exceptionEntityParameterConfigs: ExceptionEntityParameterConfigModel[] = [];
  @observable public exceptionConditionalOperators: SettingsTypeModel[] = [];
  @observable public exceptionEntityTypes: SettingsTypeModel[] = [];
  @observable public leadTimeUOMs: SettingsTypeModel[] = [];
  @observable public documents: IdNameCodeModel[] = [];
  @observable public permissionLeadTimeTypes: SettingsTypeModel[] = [];

  constructor() {
    super(baseApiPath.airports);
  }

  /* istanbul ignore next */
  public searchIcaoCode(searchValue: string): Observable<ICAOCodeModel[]> {
    // do not perform search if
    if (!searchValue || searchValue?.length < 2 || searchValue?.length > 4) {
      this.ICAOCodes = [];
      return of([]);
    }

    const request: IAPIGridRequest = {
      pageSize: 0,
      searchCollection: JSON.stringify([ Utilities.getFilter('Code', searchValue) ]),
      filterCollection: JSON.stringify([
        Utilities.getFilter('Status.Name', 'Active', 'and'),
        { propertyName: 'AirportId', propertyValue: null, operator: 'and' }, // getFiter function not accept null value
      ]),
      specifiedFields: baseEntitySearchFilters[SEARCH_ENTITY_TYPE.ICAO_CODE]?.specifiedFields,
    };
    return this.loadICAOCodes(request).pipe(
      map(response => response.results),
      tapWithAction(ICAOCodes => (this.ICAOCodes = ICAOCodes))
    );
  }

  /* istanbul ignore next */
  public loadTypes(): Observable<
    [
      SettingsTypeModel[],
      SettingsTypeModel[],
      SettingsTypeModel[],
      AirportHoursSubTypeModel[],
      ConditionTypeModel[],
      ConditionalOperatorModel[]
    ]
    > {
    return forkJoin([
      this.getSourceTypes(),
      this.getAccessLevels(),
      this.getSTDDSTTypes(),
      this.loadAirportHourSubTypes(),
      this.loadConditionTypes(),
      this.getConditionalOperators(),
    ]);
  }

  /* istanbul ignore next */
  public loadAirportHourTypes(forceRefresh?: boolean): Observable<AirportHoursTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_HOUR_TYPES,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true, sequenceNumber: 1 }]),
    };
    return this.getResult(
      apiUrls.referenceData,
      this.airportHourTypes,
      forceRefresh,
      AirportHoursTypeModel.deserializeList,
      { params, baseUrl: baseApiPath.noSqlData }
    ).pipe(tapWithAction(airportHourTypes => (this.airportHourTypes = airportHourTypes)));
  }

  /* istanbul ignore next */
  public upsertAirportHourTypes(request: AirportHoursTypeModel): Observable<AirportHoursTypeModel> {
    const isAddAirportHourTypes: boolean = request.id === 0;
    return this.upsert(request, apiUrls.airportHoursType, 'Airport Hour Type').pipe(
      map(response => AirportHoursTypeModel.deserialize(response)),
      tapWithAction((airportHourTypes: AirportHoursTypeModel) => {
        this.airportHourTypes = Utilities.updateArray<AirportHoursTypeModel>(this.airportHourTypes, airportHourTypes, {
          replace: !isAddAirportHourTypes,
          predicate: t => t.id === airportHourTypes.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadAirportHourSubTypes(forceRefresh?: boolean): Observable<AirportHoursSubTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_HOUR_SUBTYPES,
      pageSize: 0,
      sortCollection: JSON.stringify([
        { propertyName: 'AirportHoursType.Name', isAscending: true, sequenceNumber: 1 },
        { propertyName: 'SequenceId', isAscending: true, sequenceNumber: 2 },
      ]),
    };
    return this.getResult<AirportHoursSubTypeModel, IAPIAirportHoursSubTypes>(
      apiUrls.referenceData,
      this.airportHourSubTypes,
      forceRefresh,
      AirportHoursSubTypeModel.deserializeList,
      { params, baseUrl: baseApiPath.noSqlData }
    ).pipe(tapWithAction(response => (this.airportHourSubTypes = response)));
  }

  /* istanbul ignore next */
  public upsertAirportHourSubTypes(request: AirportHoursSubTypeModel): Observable<AirportHoursSubTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert<IAPIAirportHoursSubTypes>(
      request.serialize(),
      apiUrls.airportHoursSubtype,
      'Airport Hour Sub Type'
    ).pipe(
      map((response: IAPIAirportHoursSubTypes) => AirportHoursSubTypeModel.deserialize(response)),
      tapWithAction((airportHourSubType: AirportHoursSubTypeModel) => {
        this.airportHourSubTypes = Utilities.updateArray<AirportHoursSubTypeModel>(
          this.airportHourSubTypes,
          airportHourSubType,
          {
            replace: !isNewRequest,
            predicate: t => t.id === airportHourSubType.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getConditionalOperators(forceRefresh?: boolean): Observable<ConditionalOperatorModel[]> {
    const params: object = { collectionName: NO_SQL_COLLECTIONS.AIRPORT_CONDITIONAL_OPERATOR, pageSize: 0 };
    return this.getResult<ConditionalOperatorModel, IAPIConditionalOperator>(
      apiUrls.referenceData,
      this.conditionalOperators,
      forceRefresh,
      ConditionalOperatorModel.deserializeList,
      { params, baseUrl: baseApiPath.noSqlData }
    ).pipe(tapWithAction(response => (this.conditionalOperators = response)));
  }

  /* istanbul ignore next */
  public upsertConditionalOperator(request: ConditionalOperatorModel): Observable<ConditionalOperatorModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.conditionalOperator, 'Conditional Operator').pipe(
      map((response: IAPIConditionalOperator) => ConditionalOperatorModel.deserialize(response)),
      tapWithAction((conditionalOperators: ConditionalOperatorModel) => {
        this.conditionalOperators = Utilities.updateArray<ConditionalOperatorModel>(
          this.conditionalOperators,
          conditionalOperators,
          {
            replace: !isNewRequest,
            predicate: t => t.id === conditionalOperators.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadConditionTypes(forceRefresh?: boolean): Observable<ConditionTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_CONDITION_TYPE,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'SequenceId', isAscending: true, sequenceNumber: 1 }]),
    };
    return this.getResult<ConditionTypeModel, IAPIConditionType>(
      apiUrls.referenceData,
      this.conditionTypes,
      forceRefresh,
      ConditionTypeModel.deserializeList,
      { params, baseUrl: baseApiPath.noSqlData }
    ).pipe(tapWithAction(response => (this.conditionTypes = response.sort((a, b) => a.name.localeCompare(b.name)))));
  }

  /* istanbul ignore next */
  public upsertConditionType(request: IAPIConditionType): Observable<ConditionTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.conditionType, 'Condition Type').pipe(
      map((response: IAPIConditionType) => ConditionTypeModel.deserialize(response)),
      tapWithAction((conditionType: ConditionTypeModel) => {
        this.conditionTypes = Utilities.updateArray<ConditionTypeModel>(this.conditionTypes, conditionType, {
          replace: !isNewRequest,
          predicate: t => t.id === conditionType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getAirportHoursRemarks(forceRefresh?: boolean): Observable<AirportHourRemarksModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_HOUR_REMARKS,
      pageSize: 0,
      sortCollection: JSON.stringify([
        { propertyName: 'AirportHoursType.Name', isAscending: true, sequenceNumber: 1 },
        { propertyName: 'AirportHoursSubType.Name', isAscending: true, sequenceNumber: 2 },
        { propertyName: 'SequenceId', isAscending: true, sequenceNumber: 3 },
      ]),
    };

    return this.getResult<AirportHourRemarksModel, IAPIAirportHoursRemarks>(
      apiUrls.referenceData,
      this.airportHoursRemarks,
      forceRefresh,
      AirportHourRemarksModel.deserializeList,
      { params, baseUrl: baseApiPath.noSqlData }
    ).pipe(tapWithAction(airportHoursRemarks => (this.airportHoursRemarks = airportHoursRemarks)));
  }

  /* istanbul ignore next */
  public upsertAirportHourRemark(request: AirportHourRemarksModel): Observable<AirportHourRemarksModel> {
    const isAddAirportHourRemark: boolean = request.id === 0;
    return this.upsert<IAPIAirportHoursRemarks>(
      request.serialize(),
      apiUrls.airportHoursRemark,
      'Airport Hour Remark'
    ).pipe(
      map((response: IAPIAirportHoursRemarks) => {
        const hourType: AirportHoursTypeModel = this.airportHourTypes.find(
          ({ id }: AirportHoursTypeModel) => id === response?.airportHoursSubType.airportHoursTypeId
        );
        return AirportHourRemarksModel.deserialize({ ...response, airportHoursType: hourType });
      }),
      tapWithAction((airportHourRemark: AirportHourRemarksModel) => {
        this.airportHoursRemarks = Utilities.updateArray<AirportHourRemarksModel>(
          this.airportHoursRemarks,
          airportHourRemark,
          {
            replace: !isAddAirportHourRemark,
            predicate: t => t.id === airportHourRemark.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getSTDDSTTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.stddstType, this.stddstTypes, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(stddstTypes => (this.stddstTypes = stddstTypes))
    );
  }

  /* istanbul ignore next */
  public loadScheduleTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_SCHEDULE_TYPE,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true, sequenceNumber: 1 }]),
    };
    return this.getResult(apiUrls.referenceData, this.scheduleTypes, forceRefresh, SettingsTypeModel.deserializeList, {
      params,
      baseUrl: baseApiPath.noSqlData,
    }).pipe(tapWithAction((scheduleTypes: SettingsTypeModel[]) => (this.scheduleTypes = scheduleTypes)));
  }

  /* istanbul ignore next */
  public upsertScheduleType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddScheduleType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.scheduleType, 'Schedule Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((scheduleType: SettingsTypeModel) => {
        this.scheduleTypes = Utilities.updateArray<SettingsTypeModel>(this.scheduleTypes, scheduleType, {
          replace: !isAddScheduleType,
          predicate: t => t.id === scheduleType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadAirportTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_TYPE,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true, sequenceNumber: 1 }]),
    };
    return this.getResult(apiUrls.referenceData, this.airportTypes, forceRefresh, SettingsTypeModel.deserializeList, {
      params,
      baseUrl: baseApiPath.noSqlData,
      idKey: 'airportTypeId',
    }).pipe(tapWithAction((airportTypes: SettingsTypeModel[]) => (this.airportTypes = airportTypes)));
  }

  /* istanbul ignore next */
  public upsertAirportType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddAirportType: boolean = request.id === 0;
    return this.upsert<IAPIAirportType>(request, apiUrls.airportType, 'Airport Type').pipe(
      map(response => SettingsTypeModel.deserialize({ ...response, id: response.airportTypeId || response.id })),
      tapWithAction((airportTypes: SettingsTypeModel) => {
        this.airportTypes = Utilities.updateArray<SettingsTypeModel>(this.airportTypes, airportTypes, {
          replace: !isAddAirportType,
          predicate: t => t.id === airportTypes.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadAirportFacilityTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_FACILITY_TYPE,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true, sequenceNumber: 1 }]),
    };
    return this.getResult(
      apiUrls.referenceData,
      this.airportFacilityTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.noSqlData,
        idKey: 'airportFacilityTypeId',
      }
    ).pipe(
      tapWithAction((airportFacilityTypes: SettingsTypeModel[]) => (this.airportFacilityTypes = airportFacilityTypes))
    );
  }

  /* istanbul ignore next */
  public upsertAirportFacilityType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddAirportFacilityType: boolean = request.id === 0;
    return this.upsert<IAPIAirportFacility>(request, apiUrls.airportFacilityType, 'Airport Facility Type').pipe(
      map(response =>
        SettingsTypeModel.deserialize({ ...response, id: response.airportFacilityTypeId || response.id })
      ),
      tapWithAction((airportFacilityTypes: SettingsTypeModel) => {
        this.airportFacilityTypes = Utilities.updateArray<SettingsTypeModel>(
          this.airportFacilityTypes,
          airportFacilityTypes,
          {
            replace: !isAddAirportFacilityType,
            predicate: t => t.id === airportFacilityTypes.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadDistanceUOMs(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.DISTANCE_UOM,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true, sequenceNumber: 1 }]),
    };
    return this.getResult(apiUrls.referenceData, this.distanceUOMs, forceRefresh, SettingsTypeModel.deserializeList, {
      params,
      baseUrl: baseApiPath.noSqlData,
      idKey: 'distanceUOMId',
    }).pipe(tapWithAction((distanceUOMs: SettingsTypeModel[]) => (this.distanceUOMs = distanceUOMs)));
  }

  /* istanbul ignore next */
  public upsertDistanceUOM(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddDistanceUOM: boolean = request.id === 0;
    return this.upsert<IAPIDistanceUOM>(request, apiUrls.distanceUOM, 'Distance UOM').pipe(
      map(response => SettingsTypeModel.deserialize({ ...response, id: response.distanceUOMId || response.id })),
      tapWithAction((distanceUOM: SettingsTypeModel) => {
        this.distanceUOMs = Utilities.updateArray<SettingsTypeModel>(this.distanceUOMs, distanceUOM, {
          replace: !isAddDistanceUOM,
          predicate: t => t.id === distanceUOM.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadAirportDirections(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_DIRECTION,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true, sequenceNumber: 1 }]),
    };
    return this.getResult(
      apiUrls.referenceData,
      this.airportDirections,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.noSqlData,
        idKey: 'airportDirectionId',
      }
    ).pipe(tapWithAction((airportDirections: SettingsTypeModel[]) => (this.airportDirections = airportDirections)));
  }

  /* istanbul ignore next */
  public upsertAirportDirection(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddAirportDirection: boolean = request.id === 0;
    return this.upsert<IAPIAirportDirection>(request, apiUrls.airportDirection, 'Airport Direction').pipe(
      map(response => SettingsTypeModel.deserialize({ ...response, id: response.airportDirectionId || response.id })),
      tapWithAction((airportDirection: SettingsTypeModel) => {
        this.airportDirections = Utilities.updateArray<SettingsTypeModel>(this.airportDirections, airportDirection, {
          replace: !isAddAirportDirection,
          predicate: t => t.id === airportDirection.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadAirportUsageTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_USAGE_TYPE,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true, sequenceNumber: 1 }]),
    };
    return this.getResult(
      apiUrls.referenceData,
      this.airportUsageTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.noSqlData,
        idKey: 'airportUsageTypeId',
      }
    ).pipe(tapWithAction((airportUsageTypes: SettingsTypeModel[]) => (this.airportUsageTypes = airportUsageTypes)));
  }

  /* istanbul ignore next */
  public upsertAirportUsageType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddAirportUsageType: boolean = request.id === 0;
    return this.upsert<IAPIAirportUsage>(request, apiUrls.airportUsageType, 'Airport Usage Type').pipe(
      map(response => SettingsTypeModel.deserialize({ ...response, id: response.airportUsageTypeId || response.id })),
      tapWithAction((airportUsageType: SettingsTypeModel) => {
        this.airportUsageTypes = Utilities.updateArray<SettingsTypeModel>(this.airportUsageTypes, airportUsageType, {
          replace: !isAddAirportUsageType,
          predicate: t => t.id === airportUsageType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadAirportFacilityAccessLevels(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_FACILITY_ACCESS_LEVEL,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true, sequenceNumber: 1 }]),
    };
    return this.getResult(
      apiUrls.referenceData,
      this.airportFacilityAccessLevels,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.noSqlData,
        idKey: 'airportFacilityAccessLevelId',
      }
    ).pipe(
      tapWithAction(
        (airportFacilityAccessLevels: SettingsTypeModel[]) =>
          (this.airportFacilityAccessLevels = airportFacilityAccessLevels)
      )
    );
  }

  /* istanbul ignore next */
  public upsertAirportFacilityAccessLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddAirportFacilityAccessLevel: boolean = request.id === 0;
    return this.upsert<IAPIAirportFacilityAccessLevel>(
      request,
      apiUrls.airportFacilityAccessLevel,
      'Airport Facility Access Level'
    ).pipe(
      map(response =>
        SettingsTypeModel.deserialize({ ...response, id: response.airportFacilityAccessLevelId || response.id })
      ),
      tapWithAction((airportFacilityAccessLevel: SettingsTypeModel) => {
        this.airportFacilityAccessLevels = Utilities.updateArray<SettingsTypeModel>(
          this.airportFacilityAccessLevels,
          airportFacilityAccessLevel,
          {
            replace: !isAddAirportFacilityAccessLevel,
            predicate: t => t.id === airportFacilityAccessLevel.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadICAOCodes(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<ICAOCodeModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.ICAO_CODE,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIICAOCode>>(`${apiUrls.referenceData}?${params}`).pipe(
      map(response => {
        return {
          ...response,
          results: ICAOCodeModel.deserializeList(response.results),
        };
      })
    );
  }

  /* istanbul ignore next */
  public upsertICAOCode(request: ICAOCodeModel): Observable<ICAOCodeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIICAOCode>(request.serialize(), apiUrls.ICAOCode, 'ICAO Code').pipe(
      map(response => ICAOCodeModel.deserialize({ ...response })),
      tapWithAction((model: ICAOCodeModel) => {
        this.ICAOCodes = Utilities.updateArray<ICAOCodeModel>(this.ICAOCodes, model, {
          replace: !isAddRequest,
          predicate: t => t.id === model.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadICAOAuditHistory(code: string): Observable<AirportModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      filterCollection: JSON.stringify([{ code }]),
    });

    return http
      .get<IAPIPageResponse<IAPIAirport>>(`${apiUrls.ICAOCodeAuditHistory}?${params}`)
      .pipe(map(response => AirportModel.deserializeList(response.results)));
  }

  /* istanbul ignore next */
  public loadAirportHourBuffers(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<AirportHoursBufferModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_HOURS_BUFFER,
      sortCollection: JSON.stringify([{ propertyName: 'AirportHoursType.Name', isAscending: true }]),
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIAirportHoursBuffer>>(`${apiUrls.referenceData}?${params}`).pipe(
      map(response => {
        return {
          ...response,
          results: AirportHoursBufferModel.deserializeList(response.results),
        };
      })
    );
  }

  /* istanbul ignore next */
  public upsertAirportHourBuffer(request: AirportHoursBufferModel): Observable<AirportHoursBufferModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIAirportHoursBuffer>(
      request.serialize(),
      apiUrls.airportHoursBuffer,
      'Airport Hour Buffer'
    ).pipe(
      map(response => AirportHoursBufferModel.deserialize({ ...response })),
      tapWithAction((model: AirportHoursBufferModel) => {
        this.airportHourBuffers = Utilities.updateArray<AirportHoursBufferModel>(this.airportHourBuffers, model, {
          replace: !isAddRequest,
          predicate: t => t.id === model.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadMilitaryUseTypes(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<MilitaryUseTypeModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.MILITARY_USE_TYPE,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
      ...pageRequest,
    });
    return http.get<IAPIPageResponse<IAPIMilitaryUseType>>(`${apiUrls.militaryUseType}?${params}`).pipe(
      map(response => {
        return {
          ...response,
          results: MilitaryUseTypeModel.deserializeList(response.results),
        };
      }),
      tapWithAction(response => (this.militaryUseType = response.results))
    );
  }

  /* istanbul ignore next */
  public loadRunwaySurfaceTypes(forceRefresh?: boolean): Observable<RunwaySurfaceTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.RUNWAY_SURFACE_TYPE,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.runwaySurfaceType,
      this.runwaySurfaceTypes,
      forceRefresh,
      RunwaySurfaceTypeModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.airports,
        idKey: 'runwaySurfaceTypeId',
      }
    ).pipe(
      tapWithAction((runwaySurfaceTypes: RunwaySurfaceTypeModel[]) => (this.runwaySurfaceTypes = runwaySurfaceTypes))
    );
  }

  /* istanbul ignore next */
  public upsertRunwaySurfaceType(request: RunwaySurfaceTypeModel): Observable<RunwaySurfaceTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIRunwaySurfaceType>(
      request.serialize(),
      apiUrls.runwaySurfaceType,
      'Runway Surface Type'
    ).pipe(
      map(response =>
        RunwaySurfaceTypeModel.deserialize({ ...response, id: response.runwaySurfaceTypeId || response.id })
      ),
      tapWithAction((model: RunwaySurfaceTypeModel) => {
        this.runwaySurfaceTypes = Utilities.updateArray<RunwaySurfaceTypeModel>(this.runwaySurfaceTypes, model, {
          replace: !isAddRequest,
          predicate: t => t.id === model.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRunwayConditions(forceRefresh?: boolean): Observable<RunwaySettingsTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.RUNWAY_CONDITION,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.runwayCondition,
      this.runwayConditions,
      forceRefresh,
      RunwaySettingsTypeModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.airports,
        idKey: 'runwayConditionId',
      }
    ).pipe(tapWithAction((runwayConditions: RunwaySettingsTypeModel[]) => (this.runwayConditions = runwayConditions)));
  }

  /* istanbul ignore next */
  public upsertRunwayCondition(request: RunwaySettingsTypeModel): Observable<RunwaySettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIRunwayCondition>(request.serialize(), apiUrls.runwayCondition, 'Runway Condition').pipe(
      map(response =>
        RunwaySettingsTypeModel.deserialize({ ...response, id: response.runwayConditionId || response.id })
      ),
      tapWithAction((model: RunwaySettingsTypeModel) => {
        this.runwayConditions = Utilities.updateArray<RunwaySettingsTypeModel>(this.runwayConditions, model, {
          replace: !isAddRequest,
          predicate: t => t.id === model.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRunwaySurfaceTreatments(forceRefresh?: boolean): Observable<RunwaySettingsTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.RUNWAY_SURFACE_TREATMENT,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.runwaySurfaceTreatment,
      this.runwaySurfaceTreatments,
      forceRefresh,
      RunwaySettingsTypeModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.airports,
        idKey: 'runwaySurfaceTreatmentId',
      }
    ).pipe(
      tapWithAction(
        (runwaySurfaceTreatments: RunwaySettingsTypeModel[]) => (this.runwaySurfaceTreatments = runwaySurfaceTreatments)
      )
    );
  }

  /* istanbul ignore next */
  public upsertRunwaySurfaceTreatment(request: RunwaySettingsTypeModel): Observable<RunwaySettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIRunwaySurfaceTreatment>(
      request.serialize(),
      apiUrls.runwaySurfaceTreatment,
      'Runway Surface Treatment'
    ).pipe(
      map(response =>
        RunwaySettingsTypeModel.deserialize({ ...response, id: response.runwaySurfaceTreatmentId || response.id })
      ),
      tapWithAction((model: RunwaySettingsTypeModel) => {
        this.runwaySurfaceTreatments = Utilities.updateArray<RunwaySettingsTypeModel>(
          this.runwaySurfaceTreatments,
          model,
          {
            replace: !isAddRequest,
            predicate: t => t.id === model.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadRunwayLightTypes(forceRefresh?: boolean): Observable<RunwayLightTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.RUNWAY_LIGHT_TYPE,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.runwayLightType,
      this.runwayLightTypes,
      forceRefresh,
      RunwayLightTypeModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.airports,
        idKey: 'runwayLightTypeId',
      }
    ).pipe(tapWithAction((runwayLightTypes: RunwayLightTypeModel[]) => (this.runwayLightTypes = runwayLightTypes)));
  }

  /* istanbul ignore next */
  public upsertRunwayLightType(request: RunwayLightTypeModel): Observable<RunwayLightTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIRunwayLightType>(request.serialize(), apiUrls.runwayLightType, 'Runway Light Type').pipe(
      map(response => RunwayLightTypeModel.deserialize({ ...response, id: response.runwayLightTypeId || response.id })),
      tapWithAction((model: RunwayLightTypeModel) => {
        this.runwayLightTypes = Utilities.updateArray<RunwayLightTypeModel>(this.runwayLightTypes, model, {
          replace: !isAddRequest,
          predicate: t => t.id === model.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRunwayRVR(forceRefresh?: boolean): Observable<RunwaySettingsTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.RUNWAY_RVR,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
    };
    return this.getResult(apiUrls.runwayRVR, this.runwayRVR, forceRefresh, RunwaySettingsTypeModel.deserializeList, {
      params,
      baseUrl: baseApiPath.airports,
      idKey: 'runwayRVRId',
    }).pipe(tapWithAction((runwayRVR: RunwaySettingsTypeModel[]) => (this.runwayRVR = runwayRVR)));
  }

  /* istanbul ignore next */
  public upsertRunwayRVR(request: RunwaySettingsTypeModel): Observable<RunwaySettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIRunwayRVR>(request.serialize(), apiUrls.runwayRVR, 'Runway RVR').pipe(
      map(response => RunwaySettingsTypeModel.deserialize({ ...response, id: response.runwayRVRId || response.id })),
      tapWithAction((model: RunwaySettingsTypeModel) => {
        this.runwayRVR = Utilities.updateArray<RunwaySettingsTypeModel>(this.runwayRVR, model, {
          replace: !isAddRequest,
          predicate: t => t.id === model.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRunwayApproachLight(forceRefresh?: boolean): Observable<RunwaySettingsTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.RUNWAY_APPROACH_LIGHT,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.runwayApproachLight,
      this.runwayApproachLight,
      forceRefresh,
      RunwaySettingsTypeModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.airports,
        idKey: 'runwayApproachLightId',
      }
    ).pipe(
      tapWithAction(
        (runwayApproachLight: RunwaySettingsTypeModel[]) => (this.runwayApproachLight = runwayApproachLight)
      )
    );
  }

  /* istanbul ignore next */
  public upsertRunwayApproachLight(request: RunwaySettingsTypeModel): Observable<RunwaySettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIRunwayApproachLight>(
      request.serialize(),
      apiUrls.runwayApproachLight,
      'Runway Approach Light'
    ).pipe(
      map(response =>
        RunwaySettingsTypeModel.deserialize({ ...response, id: response.runwayApproachLightId || response.id })
      ),
      tapWithAction((model: RunwaySettingsTypeModel) => {
        this.runwayApproachLight = Utilities.updateArray<RunwaySettingsTypeModel>(this.runwayApproachLight, model, {
          replace: !isAddRequest,
          predicate: t => t.id === model.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRunwayVGSI(forceRefresh?: boolean): Observable<RunwaySettingsTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.RUNWAY_VGSI,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
    };
    return this.getResult(apiUrls.runwayVGSI, this.runwayVGSI, forceRefresh, RunwaySettingsTypeModel.deserializeList, {
      params,
      baseUrl: baseApiPath.airports,
      idKey: 'runwayVGSIId',
    }).pipe(tapWithAction((runwayVGSI: RunwaySettingsTypeModel[]) => (this.runwayVGSI = runwayVGSI)));
  }

  /* istanbul ignore next */
  public upsertRunwayVGSI(request: RunwaySettingsTypeModel): Observable<RunwaySettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIRunwayVGSI>(request.serialize(), apiUrls.runwayVGSI, 'Runway VGSI').pipe(
      map(response => RunwaySettingsTypeModel.deserialize({ ...response, id: response.runwayVGSIId || response.id })),
      tapWithAction((model: RunwaySettingsTypeModel) => {
        this.runwayVGSI = Utilities.updateArray<RunwaySettingsTypeModel>(this.runwayVGSI, model, {
          replace: !isAddRequest,
          predicate: t => t.id === model.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadAirportDataSources(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_DATA_SOURCE,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true, sequenceNumber: 1 }]),
    };
    return this.getResult(
      apiUrls.referenceData,
      this.airportDataSources,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.noSqlData,
        idKey: 'airportDataSourceId',
      }
    ).pipe(tapWithAction((airportDataSources: SettingsTypeModel[]) => (this.airportDataSources = airportDataSources)));
  }

  /* istanbul ignore next */
  public upsertAirportDataSource(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddAirportDataSource: boolean = request.id === 0;
    return this.upsert<IAPIAirportDataSource>(request, apiUrls.airportDataSource, 'Airport Data Source').pipe(
      map(response => SettingsTypeModel.deserialize({ ...response, id: response.airportDataSourceId || response.id })),
      tapWithAction((airportDataSource: SettingsTypeModel) => {
        this.airportDataSources = Utilities.updateArray<SettingsTypeModel>(this.airportDataSources, airportDataSource, {
          replace: !isAddAirportDataSource,
          predicate: t => t.id === airportDataSource.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadWeatherReportingSystem(forceRefresh?: boolean): Observable<AirportCodeSettingsModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.WEATHER_REPORTING_SYSTEMS,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.weatherReportingSystem,
      this.weatherReportingSystem,
      forceRefresh,
      AirportCodeSettingsModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.airports,
      }
    ).pipe(
      tapWithAction(
        (weatherReportingSystem: AirportCodeSettingsModel[]) => (this.weatherReportingSystem = weatherReportingSystem)
      )
    );
  }

  /* istanbul ignore next */
  public upsertWeatherReportingSystem(request: AirportCodeSettingsModel): Observable<AirportCodeSettingsModel> {
    return this.upsert<IAPICodeSettings>(
      request.serialize(),
      apiUrls.weatherReportingSystem,
      'Weather Reporting System'
    ).pipe(
      map(response => AirportCodeSettingsModel.deserialize({ ...response })),
      tapWithAction((model: AirportCodeSettingsModel) => {
        this.weatherReportingSystem = Utilities.updateArray<AirportCodeSettingsModel>(
          this.weatherReportingSystem,
          model,
          {
            replace: false,
            predicate: t => t.id === model.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadClassCode(forceRefresh?: boolean): Observable<AirportCodeSettingsModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_CLASS_CODE,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.airportClassCode,
      this.airportClassCode,
      forceRefresh,
      AirportCodeSettingsModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.airports,
      }
    ).pipe(tapWithAction((airportClassCode: AirportCodeSettingsModel[]) => (this.airportClassCode = airportClassCode)));
  }

  /* istanbul ignore next */
  public upsertClassCode(request: AirportCodeSettingsModel): Observable<AirportCodeSettingsModel> {
    return this.upsert<IAPICodeSettings>(request.serialize(), apiUrls.airportClassCode, 'Class Code').pipe(
      map(response => AirportCodeSettingsModel.deserialize({ ...response })),
      tapWithAction((model: AirportCodeSettingsModel) => {
        this.airportClassCode = Utilities.updateArray<AirportCodeSettingsModel>(this.airportClassCode, model, {
          replace: false,
          predicate: t => t.id === model.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadCertificateCode(forceRefresh?: boolean): Observable<AirportCodeSettingsModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_CERTIFICATE_CODE,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.airportCertificateCode,
      this.airportCertificateCode,
      forceRefresh,
      AirportCodeSettingsModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.airports,
      }
    ).pipe(
      tapWithAction(
        (airportCertificateCode: AirportCodeSettingsModel[]) => (this.airportCertificateCode = airportCertificateCode)
      )
    );
  }

  /* istanbul ignore next */
  public upsertCertificateCode(request: AirportCodeSettingsModel): Observable<AirportCodeSettingsModel> {
    return this.upsert<IAPICodeSettings>(request.serialize(), apiUrls.airportCertificateCode, 'Certificate Code').pipe(
      map(response => AirportCodeSettingsModel.deserialize({ ...response })),
      tapWithAction((model: AirportCodeSettingsModel) => {
        this.airportCertificateCode = Utilities.updateArray<AirportCodeSettingsModel>(
          this.airportCertificateCode,
          model,
          {
            replace: false,
            predicate: t => t.id === model.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadServiceCode(forceRefresh?: boolean): Observable<AirportCodeSettingsModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_SERVICE_CODE,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.airportServiceCode,
      this.airportServiceCode,
      forceRefresh,
      AirportCodeSettingsModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.airports,
      }
    ).pipe(
      tapWithAction((airportServiceCode: AirportCodeSettingsModel[]) => (this.airportServiceCode = airportServiceCode))
    );
  }

  /* istanbul ignore next */
  public upsertServiceCode(request: AirportCodeSettingsModel): Observable<AirportCodeSettingsModel> {
    return this.upsert<IAPICodeSettings>(request.serialize(), apiUrls.airportServiceCode, 'Service Code').pipe(
      map(response => AirportCodeSettingsModel.deserialize({ ...response })),
      tapWithAction((model: AirportCodeSettingsModel) => {
        this.airportServiceCode = Utilities.updateArray<AirportCodeSettingsModel>(this.airportServiceCode, model, {
          replace: false,
          predicate: t => t.id === model.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadAirportCategory(forceRefresh?: boolean): Observable<AirportCategoryModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_CATEGORY,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.airportCategory,
      this.airportCategory,
      forceRefresh,
      AirportCategoryModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.airports,
      }
    ).pipe(tapWithAction((airportCategory: AirportCategoryModel[]) => (this.airportCategory = airportCategory)));
  }

  /* istanbul ignore next */
  public upsertAirportCategory(request: AirportCategoryModel): Observable<AirportCategoryModel> {
    return this.upsert<IAPIAirportCategory>(request.serialize(), apiUrls.airportCategory, 'Airport Category').pipe(
      map(response => AirportCategoryModel.deserialize({ ...response })),
      tapWithAction((model: AirportCategoryModel) => {
        this.airportCategory = Utilities.updateArray<AirportCategoryModel>(this.airportCategory, model, {
          replace: false,
          predicate: t => t.id === model.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRunwayNavaids(forceRefresh?: boolean): Observable<RunwaySettingsTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.RUNWAY_VGSI,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.runwayNavaids,
      this.runwayNavaids,
      forceRefresh,
      RunwaySettingsTypeModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.airports,
        idKey: 'runwayNavaidId',
      }
    ).pipe(tapWithAction((runwayNavaids: RunwaySettingsTypeModel[]) => (this.runwayNavaids = runwayNavaids)));
  }

  /* istanbul ignore next */
  public upsertRunwayNavaids(request: RunwaySettingsTypeModel): Observable<RunwaySettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIRunwayNavaids>(request.serialize(), apiUrls.runwayNavaids, 'Runway Navaid').pipe(
      map(response => RunwaySettingsTypeModel.deserialize({ ...response, id: response.runwayNavaidId || response.id })),
      tapWithAction((model: RunwaySettingsTypeModel) => {
        this.runwayVGSI = Utilities.updateArray<RunwaySettingsTypeModel>(this.runwayNavaids, model, {
          replace: !isAddRequest,
          predicate: t => t.id === model.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRunwayApproachType(forceRefresh?: boolean): Observable<RunwaySettingsTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.RUNWAY_APPROACH_TYPE,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.runwayApproachType,
      this.runwayApproachType,
      forceRefresh,
      RunwaySettingsTypeModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.airports,
        idKey: 'runwayApproachTypeId',
      }
    ).pipe(
      tapWithAction((runwayApproachType: RunwaySettingsTypeModel[]) => (this.runwayApproachType = runwayApproachType))
    );
  }

  /* istanbul ignore next */
  public upsertRunwayApproachType(request: RunwaySettingsTypeModel): Observable<RunwaySettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIRunwayApproachTypeId>(
      request.serialize(),
      apiUrls.runwayApproachType,
      'Runway ILS Approach Type'
    ).pipe(
      map(response =>
        RunwaySettingsTypeModel.deserialize({ ...response, id: response.runwayApproachTypeId || response.id })
      ),
      tapWithAction((model: RunwaySettingsTypeModel) => {
        this.runwayApproachType = Utilities.updateArray<RunwaySettingsTypeModel>(this.runwayApproachType, model, {
          replace: !isAddRequest,
          predicate: t => t.id === model.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRunwayUsageTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.RUNWAY_USAGE_TYPE,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.runwayUsageType,
      this.runwayUsageTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      {
        params,
        baseUrl: baseApiPath.airports,
        idKey: 'runwayUsageTypeId',
      }
    ).pipe(tapWithAction((runwayUsageTypes: SettingsTypeModel[]) => (this.runwayUsageTypes = runwayUsageTypes)));
  }

  /* istanbul ignore next */
  public upsertRunwayUsageType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIRunwayUsageType>(request, apiUrls.runwayUsageType, 'Runway Usage Type').pipe(
      map(response => SettingsTypeModel.deserialize({ ...response, id: response.runwayUsageTypeId || response.id })),
      tapWithAction((model: SettingsTypeModel) => {
        this.runwayUsageTypes = Utilities.updateArray<SettingsTypeModel>(this.runwayUsageTypes, model, {
          replace: !isAddRequest,
          predicate: t => t.id === model.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadAirportOfEntries(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<IdNameCodeModel>> {
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
      tapWithAction(response => (this.airportOfEntry = response.results))
    );
  }

  /* istanbul ignore next */
  public upsertAirportOfEntry(request: IdNameCodeModel): Observable<IdNameCodeModel> {
    return this.upsert<IAPIIdNameCode>(request.serialize(), apiUrls.airportOfEntry, 'Airport Of Entry').pipe(
      map(response => IdNameCodeModel.deserialize({ ...response })),
      tapWithAction((model: IdNameCodeModel) => {
        this.airportOfEntry = Utilities.updateArray<IdNameCodeModel>(this.airportOfEntry, model, {
          replace: false,
          predicate: t => t.id === model.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadFrequencyTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.frequencyType,
      this.frequencyTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(frequencyTypes => (this.frequencyTypes = frequencyTypes)));
  }

  /* istanbul ignore next */
  public upsertFrequencyType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIFrequencyType>(request, apiUrls.frequencyType, 'Frequency Type').pipe(
      map(response => SettingsTypeModel.deserialize({ ...response, id: response.frequencyTypeId || response.id })),
      tapWithAction((frequencyType: SettingsTypeModel) => {
        this.frequencyTypes = Utilities.updateArray<SettingsTypeModel>(this.frequencyTypes, frequencyType, {
          replace: !isAddRequest,
          predicate: t => t.id === frequencyType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadSectors(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.sector, this.sectors, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(sectors => (this.sectors = sectors))
    );
  }

  /* istanbul ignore next */
  public upsertSector(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPISector>(request, apiUrls.sector, 'Sector').pipe(
      map(response => SettingsTypeModel.deserialize({ ...response, id: response.sectorId || response.id })),
      tapWithAction((sector: SettingsTypeModel) => {
        this.sectors = Utilities.updateArray<SettingsTypeModel>(this.sectors, sector, {
          replace: !isAddRequest,
          predicate: t => t.id === sector.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadFuelTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.fuelType, this.fuelTypes, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(fuelTypes => (this.fuelTypes = fuelTypes))
    );
  }

  /* istanbul ignore next */
  public upsertFuelTypes(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.fuelType, 'Fuel Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((fuelType: SettingsTypeModel) => {
        this.fuelTypes = Utilities.updateArray<SettingsTypeModel>(this.fuelTypes, fuelType, {
          replace: !isNewRequest,
          predicate: t => t.id === fuelType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadOilTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.oilType, this.oilTypes, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(oilTypes => (this.oilTypes = oilTypes))
    );
  }

  /* istanbul ignore next */
  public upsertOilTypes(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.oilType, 'Oil Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((oilType: SettingsTypeModel) => {
        this.oilTypes = Utilities.updateArray<SettingsTypeModel>(this.oilTypes, oilType, {
          replace: !isNewRequest,
          predicate: t => t.id === oilType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadAreaPortAssignments(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.areaPortAssignment,
      this.areaPortAssignments,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(areaPortAssignments => (this.areaPortAssignments = areaPortAssignments)));
  }

  /* istanbul ignore next */
  public upsertAreaPortAssignment(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.areaPortAssignment, 'Area Port Assignment').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((areaPortAssignment: SettingsTypeModel) => {
        this.areaPortAssignments = Utilities.updateArray<SettingsTypeModel>(
          this.areaPortAssignments,
          areaPortAssignment,
          {
            replace: !isNewRequest,
            predicate: t => t.id === areaPortAssignment.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadRequiredInformationTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.requiredInformationType,
      this.requiredInformationTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(requiredInformationTypes => (this.requiredInformationTypes = requiredInformationTypes)));
  }

  /* istanbul ignore next */
  public upsertRequiredInformationType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.requiredInformationType, 'Required Information Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((requiredInformationType: SettingsTypeModel) => {
        this.requiredInformationTypes = Utilities.updateArray<SettingsTypeModel>(
          this.requiredInformationTypes,
          requiredInformationType,
          {
            replace: !isNewRequest,
            predicate: t => t.id === requiredInformationType.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadFieldOfficeOversights(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.fieldOfficeOversight,
      this.fieldOfficeOversights,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(fieldOfficeOversights => (this.fieldOfficeOversights = fieldOfficeOversights)));
  }

  /* istanbul ignore next */
  public upsertFieldOfficeOversight(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.fieldOfficeOversight, 'Field Office Oversight').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((fieldOfficeOversight: SettingsTypeModel) => {
        this.fieldOfficeOversights = Utilities.updateArray<SettingsTypeModel>(
          this.fieldOfficeOversights,
          fieldOfficeOversight,
          {
            replace: !isNewRequest,
            predicate: t => t.id === fieldOfficeOversight.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadCustomsLocationInformation(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.customsLocationInformation,
      this.customsLocationInformation,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(customsLocationInformation => (this.customsLocationInformation = customsLocationInformation)));
  }

  /* istanbul ignore next */
  public upsertCustomsLocationInformation(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.customsLocationInformation, 'Customs Location Information').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((customsLocationInformation: SettingsTypeModel) => {
        this.customsLocationInformation = Utilities.updateArray<SettingsTypeModel>(
          this.customsLocationInformation,
          customsLocationInformation,
          {
            replace: !isNewRequest,
            predicate: t => t.id === customsLocationInformation.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadMaxPOBOptions(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.maxPOBOption,
      this.maxPOBOptions,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(maxPOBOptions => (this.maxPOBOptions = maxPOBOptions)));
  }

  /* istanbul ignore next */
  public upsertMaxPOBOption(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.maxPOBOption, 'Max POB Option').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((maxPOBOption: SettingsTypeModel) => {
        this.maxPOBOptions = Utilities.updateArray<SettingsTypeModel>(this.maxPOBOptions, maxPOBOption, {
          replace: !isNewRequest,
          predicate: t => t.id === maxPOBOption.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadCbpPortTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.cbpPortType, this.cbpPortTypes, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(cbpPortTypes => (this.cbpPortTypes = cbpPortTypes))
    );
  }

  /* istanbul ignore next */
  public upsertCbpPortType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.cbpPortType, 'CBP Port Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((cbpPortType: SettingsTypeModel) => {
        this.cbpPortTypes = Utilities.updateArray<SettingsTypeModel>(this.cbpPortTypes, cbpPortType, {
          replace: !isNewRequest,
          predicate: t => t.id === cbpPortType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadVisaTimings(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.visaTiming, this.visaTimings, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(visaTimings => (this.visaTimings = visaTimings))
    );
  }

  /* istanbul ignore next */
  public upsertVisaTiming(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.visaTiming, 'Visa Timing').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((visaTiming: SettingsTypeModel) => {
        this.visaTimings = Utilities.updateArray<SettingsTypeModel>(this.visaTimings, visaTiming, {
          replace: !isNewRequest,
          predicate: t => t.id === visaTiming.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadUwaCodes(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<AirportCodeSettingsModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPICodeSettings>>(`${apiUrls.uwaAirportCode}?${params}`).pipe(
      map(response => {
        return {
          ...response,
          results: AirportCodeSettingsModel.deserializeList(response.results),
        };
      }),
      tapWithAction(response => (this.uwaCodes = response.results))
    );
  }

  /* istanbul ignore next */
  public upsertUwaCode(request: AirportCodeSettingsModel): Observable<AirportCodeSettingsModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.uwaAirportCode, 'UWA Code').pipe(
      map(response => AirportCodeSettingsModel.deserialize(response)),
      tapWithAction((uwaCode: AirportCodeSettingsModel) => {
        this.uwaCodes = Utilities.updateArray<AirportCodeSettingsModel>(this.uwaCodes, uwaCode, {
          replace: !isNewRequest,
          predicate: t => t.id === uwaCode.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRegionalCodes(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<AirportCodeSettingsModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPICodeSettings>>(`${apiUrls.regionalAirportCode}?${params}`).pipe(
      map(response => {
        return {
          ...response,
          results: AirportCodeSettingsModel.deserializeList(response.results),
        };
      }),
      tapWithAction(response => (this.regionalCodes = response.results))
    );
  }

  /* istanbul ignore next */
  public upsertRegionalCode(request: AirportCodeSettingsModel): Observable<AirportCodeSettingsModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.regionalAirportCode, 'Regional Code').pipe(
      map(response => AirportCodeSettingsModel.deserialize(response)),
      tapWithAction((regionalCode: AirportCodeSettingsModel) => {
        this.regionalCodes = Utilities.updateArray<AirportCodeSettingsModel>(this.regionalCodes, regionalCode, {
          replace: !isNewRequest,
          predicate: t => t.id === regionalCode.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRampSideAccess(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.rampSideAccess,
      this.rampSideAccess,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(rampSideAccess => (this.rampSideAccess = rampSideAccess)));
  }

  /* istanbul ignore next */
  public upsertRampSideAccess(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.rampSideAccess, 'Ramp Side Access').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.rampSideAccess = Utilities.updateArray<SettingsTypeModel>(this.rampSideAccess, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRampSideAccessThirdParty(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.rampSideAccessThirdParty,
      this.rampSideAccess3rdPartyVendors,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(rampSideAccess3rdParty => (this.rampSideAccess3rdParty = rampSideAccess3rdParty)));
  }

  /* istanbul ignore next */
  public upsertRampSideAccessThirdParty(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.rampSideAccessThirdParty, 'Ramp Side Access Third Party').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.rampSideAccess3rdParty = Utilities.updateArray<SettingsTypeModel>(this.rampSideAccess3rdParty, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRampSideAccessThirdPartyVendors(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.rampSideAccessThirdPartyVendors,
      this.rampSideAccess3rdPartyVendors,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(
      tapWithAction(
        rampSideAccess3rdPartyVendors => (this.rampSideAccess3rdPartyVendors = rampSideAccess3rdPartyVendors)
      )
    );
  }

  /* istanbul ignore next */
  public upsertRampSideAccessThirdPartyVendors(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.rampSideAccessThirdPartyVendors, 'Ramp Side Access Third Party Vendors').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.rampSideAccess3rdPartyVendors = Utilities.updateArray<SettingsTypeModel>(
          this.rampSideAccess3rdPartyVendors,
          response,
          {
            replace: !isNewRequest,
            predicate: t => t.id === response.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadRecommendedServices(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.recommendedServices,
      this.recommendedServices,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(recommendedServices => (this.recommendedServices = recommendedServices)));
  }

  /* istanbul ignore next */
  public upsertRecommendedServices(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.recommendedServices, 'Recommended Services').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.recommendedServices = Utilities.updateArray<SettingsTypeModel>(this.recommendedServices, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadSecurityMeasures(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.securityMeasures,
      this.securityMeasures,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(securityMeasures => (this.securityMeasures = securityMeasures)));
  }

  /* istanbul ignore next */
  public upsertSecurityMeasures(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.securityMeasures, 'Security Measures').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.securityMeasures = Utilities.updateArray<SettingsTypeModel>(this.securityMeasures, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  public loadDestinationAlternateTOFs(forceRefresh?: boolean): Observable<IdNameCodeModel[]> {
    return this.getResult(
      apiUrls.destinationAlternateTOF,
      this.destinationAlternateTOFs,
      forceRefresh,
      IdNameCodeModel.deserializeList
    ).pipe(tapWithAction(flights => (this.destinationAlternateTOFs = flights)));
  }

  /* istanbul ignore next */
  public upsertDestinationAlternateTOF(request: IdNameCodeModel): Observable<IdNameCodeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.destinationAlternateTOF, 'Destination Alternate-Type Of Flight').pipe(
      map(response => IdNameCodeModel.deserialize(response)),
      tapWithAction((response: IdNameCodeModel) => {
        this.destinationAlternateTOFs = Utilities.updateArray<IdNameCodeModel>(
          this.destinationAlternateTOFs,
          response,
          {
            replace: !isNewRequest,
            predicate: t => t.id === response.id,
          }
        );
      })
    );
  }

  public removeDestinationAlternateTOF(request: IdNameCodeModel): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.delete<string>(`${apiUrls.destinationAlternateTOF}/${request.id}`).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('Destination Alternate Type Of Flight deleted successfully!'))
    );
  }

  /* istanbul ignore next */
  public loadOvertime(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.overtime, this.overtime, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(overtime => (this.overtime = overtime))
    );
  }

  /* istanbul ignore next */
  public upsertOvertime(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.overtime, 'Overtime').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.overtime = Utilities.updateArray<SettingsTypeModel>(this.overtime, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRejectionReason(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.rejectionReason,
      this.rejectionReason,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(rejectionReason => (this.rejectionReason = rejectionReason)));
  }

  /* istanbul ignore next */
  public upsertRejectionReason(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.rejectionReason, 'Rejection Reason').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.rejectionReason = Utilities.updateArray<SettingsTypeModel>(this.rejectionReason, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadSegmentType(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.segmentType, this.segmentType, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(segmentType => (this.segmentType = segmentType))
    );
  }

  /* istanbul ignore next */
  public upsertSegmentType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.segmentType, 'SegmentType').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.segmentType = Utilities.updateArray<SettingsTypeModel>(this.segmentType, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadFlightType(forceRefresh?: boolean): Observable<IDCodeModel[]> {
    return this.getResult(apiUrls.flightType, this.flightType, forceRefresh, IDCodeModel.deserializeList).pipe(
      tapWithAction(flightType => (this.flightType = flightType))
    );
  }

  /* istanbul ignore next */
  public upsertFlightType(request: IDCodeModel): Observable<IDCodeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.flightType, 'FlightType').pipe(
      map(response => IDCodeModel.deserialize(response)),
      tapWithAction((response: IDCodeModel) => {
        this.flightType = Utilities.updateArray<IDCodeModel>(this.flightType, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadConditionTypeConfig(forceRefresh?: boolean): Observable<ConditionTypeConfigModel[]> {
    return this.getResult(
      apiUrls.conditionTypeConfig,
      this.conditionTypeConfig,
      forceRefresh,
      ConditionTypeConfigModel.deserializeList
    ).pipe(tapWithAction(conditionTypeConfig => (this.conditionTypeConfig = conditionTypeConfig)));
  }

  /* istanbul ignore next */
  public upsertConditionTypeConfig(model: ConditionTypeConfigModel): Observable<ConditionTypeConfigModel> {
    const isNewRequest: boolean = model.id === 0;
    return this.upsert(model.serialize(), apiUrls.conditionTypeConfig, 'Condition Type Config').pipe(
      map(response => ConditionTypeConfigModel.deserialize(response)),
      tapWithAction((response: ConditionTypeConfigModel) => {
        this.conditionTypeConfig = Utilities.updateArray<ConditionTypeConfigModel>(this.conditionTypeConfig, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadNoiseClassifications(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.noiseClassification,
      this.noiseClassifications,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.noiseClassifications = response)));
  }

  /* istanbul ignore next */
  public upsertNoiseClassification(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.noiseClassification, 'NoiseClassification').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.noiseClassifications = Utilities.updateArray<SettingsTypeModel>(this.noiseClassifications, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadLeadTimeType(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.leadTimeType,
      this.leadTimeType,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.leadTimeType = response)));
  }

  /* istanbul ignore next */
  public upsertLeadTimeType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.leadTimeType, 'Lead Time Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.leadTimeType = Utilities.updateArray<SettingsTypeModel>(this.leadTimeType, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadLargeAircraftRestriction(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.largeAircraftRestriction,
      this.largeAircraftRestriction,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.largeAircraftRestriction = response)));
  }

  /* istanbul ignore next */
  public upsertLargeAircraftRestriction(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.largeAircraftRestriction, 'Large Aircraft Restriction').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.largeAircraftRestriction = Utilities.updateArray<SettingsTypeModel>(
          this.largeAircraftRestriction,
          response,
          {
            replace: !isNewRequest,
            predicate: t => t.id === response.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadCustomsContactTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.customsContactType,
      this.customsContactTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.customsContactTypes = response)));
  }

  /* istanbul ignore next */
  public upsertCustomsContactType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.customsContactType, 'Contact Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.customsContactTypes = Utilities.updateArray<SettingsTypeModel>(this.customsContactTypes, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadCustomsContactAddressTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.customsContactAddressType,
      this.customsContactAddressTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.customsContactAddressTypes = response)));
  }

  /* istanbul ignore next */
  public upsertCustomsContactAddressType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.customsContactAddressType, 'Contact Address Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.customsContactAddressTypes = Utilities.updateArray<SettingsTypeModel>(
          this.customsContactAddressTypes,
          response,
          {
            replace: !isNewRequest,
            predicate: t => t.id === response.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadOvernightParkings(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.overnightParking,
      this.overnightParkings,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.overnightParkings = response)));
  }

  /* istanbul ignore next */
  public upsertOvernightParking(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.overnightParking, 'Overnight Parking').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.overnightParkings = Utilities.updateArray<SettingsTypeModel>(this.overnightParkings, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadNoteTypes(forceRefresh?: boolean): Observable<NoteTypeModel[]> {
    return this.getResult(apiUrls.noteType, this.noteTypes, forceRefresh, NoteTypeModel.deserializeList, {
      idKey: 'noteTypeId',
    }).pipe(tapWithAction(response => (this.noteTypes = response)));
  }

  /* istanbul ignore next */
  public upsertNoteType(request: NoteTypeModel): Observable<NoteTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.noteType, 'Note Type').pipe(
      map(response => NoteTypeModel.deserialize(response)),
      tapWithAction((response: NoteTypeModel) => {
        this.noteTypes = Utilities.updateArray<NoteTypeModel>(this.noteTypes, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadPermissionTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.permissionType,
      this.permissionTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.permissionTypes = response)));
  }

  /* istanbul ignore next */
  public upsertPermissionType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.permissionType, 'Permission Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.permissionTypes = Utilities.updateArray<SettingsTypeModel>(this.permissionTypes, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRequiredFor(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.requiredFor, this.requiredFor, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(response => (this.requiredFor = response))
    );
  }

  /* istanbul ignore next */
  public upsertRequiredFor(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.requiredFor, 'Required For').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.requiredFor = Utilities.updateArray<SettingsTypeModel>(this.requiredFor, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadExceptionRequirements(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.exceptionRequirement,
      this.exceptionRequirements,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.exceptionRequirements = response)));
  }

  /* istanbul ignore next */
  public upsertExceptionRequirement(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.exceptionRequirement, 'Exception Requirement').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.exceptionRequirements = Utilities.updateArray<SettingsTypeModel>(this.exceptionRequirements, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadNotificationTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.notificationType,
      this.notificationTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.notificationTypes = response)));
  }

  /* istanbul ignore next */
  public upsertNotificationType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.notificationType, 'Notification Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.notificationTypes = Utilities.updateArray<SettingsTypeModel>(this.notificationTypes, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadConfirmationRequiredFor(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.confirmationRequiredFor,
      this.confirmationRequiredFor,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.confirmationRequiredFor = response)));
  }

  /* istanbul ignore next */
  public upsertConfirmationRequiredFor(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.confirmationRequiredFor, 'Confirmation Required For').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.confirmationRequiredFor = Utilities.updateArray<SettingsTypeModel>(
          this.confirmationRequiredFor,
          response,
          {
            replace: !isNewRequest,
            predicate: t => t.id === response.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadRequestFormats(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.requestFormat,
      this.requestFormats,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.requestFormats = response)));
  }

  /* istanbul ignore next */
  public upsertRequestFormat(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.requestFormat, 'Request Format').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.requestFormats = Utilities.updateArray<SettingsTypeModel>(this.requestFormats, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRequestAddressTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.requestAddressType,
      this.requestAddressTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.requestAddressTypes = response)));
  }

  /* istanbul ignore next */
  public upsertRequestAddressType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.requestAddressType, 'Request Address Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.requestAddressTypes = Utilities.updateArray<SettingsTypeModel>(this.requestAddressTypes, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadPPRPurpose(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.pprPurpose, this.pprPurpose, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(response => (this.pprPurpose = response))
    );
  }

  /* istanbul ignore next */
  public upsertPPRPurpose(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.pprPurpose, 'PPR Purpose').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.pprPurpose = Utilities.updateArray<SettingsTypeModel>(this.pprPurpose, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadExceptionEntityTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.exceptionEntityType,
      this.exceptionEntityTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.exceptionEntityTypes = response)));
  }

  /* istanbul ignore next */
  public upsertExceptionEntityType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.exceptionEntityType, 'Exception Entity Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.exceptionEntityTypes = Utilities.updateArray<SettingsTypeModel>(this.exceptionEntityTypes, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadExceptionConditionalOperators(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.exceptionConditionalOperator,
      this.exceptionConditionalOperators,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.exceptionConditionalOperators = response)));
  }

  /* istanbul ignore next */
  public upsertExceptionConditionalOperator(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.exceptionConditionalOperator, 'Exception Conditional Operator').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.exceptionConditionalOperators = Utilities.updateArray<SettingsTypeModel>(
          this.exceptionConditionalOperators,
          response,
          {
            replace: !isNewRequest,
            predicate: t => t.id === response.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadExceptionEntityParameterConfigs(
    forceRefresh?: boolean
  ): Observable<ExceptionEntityParameterConfigModel[]> {
    return this.getResult(
      apiUrls.exceptionEntityParameterConfig,
      this.exceptionEntityParameterConfigs,
      forceRefresh,
      ExceptionEntityParameterConfigModel.deserializeList
    ).pipe(tapWithAction(response => (this.exceptionEntityParameterConfigs = response)));
  }

  /* istanbul ignore next */
  public upsertExceptionEntityParameterConfig(
    request: ExceptionEntityParameterConfigModel
  ): Observable<ExceptionEntityParameterConfigModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(
      request.serialize(),
      apiUrls.exceptionEntityParameterConfig,
      'Exception Entity Parameter Config'
    ).pipe(
      map(response => ExceptionEntityParameterConfigModel.deserialize(response)),
      tapWithAction((response: ExceptionEntityParameterConfigModel) => {
        this.exceptionEntityParameterConfigs = Utilities.updateArray<ExceptionEntityParameterConfigModel>(
          this.exceptionEntityParameterConfigs,
          response,
          {
            replace: !isNewRequest,
            predicate: t => t.id === response.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadReportTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.airportDataExportReportType,
      this.reportTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.reportTypes = response)));
  }

  /* istanbul ignore next */
  public upsertReportType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.airportDataExportReportType, 'Report Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.reportTypes = Utilities.updateArray<SettingsTypeModel>(this.reportTypes, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRequestStatus(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.airportDataExportRequestStatus,
      this.requestStatus,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.requestStatus = response)));
  }

  /* istanbul ignore next */
  public upsertRequestStatus(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.airportDataExportRequestStatus, 'Request Status').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.requestStatus = Utilities.updateArray<SettingsTypeModel>(this.requestStatus, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadLeadTimeUoms(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.timeLevelUOM,
      this.leadTimeUOMs,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.leadTimeUOMs = response)));
  }

  /* istanbul ignore next */
  public upsertLeadTimeUom(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.timeLevelUOM, 'Lead Time UOM').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.leadTimeUOMs = Utilities.updateArray<SettingsTypeModel>(this.leadTimeUOMs, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  public loadDocuments(forceRefresh: boolean = false): Observable<IdNameCodeModel[]> {
    return this.getResult(
      apiUrls.document,
      this.documents,
      forceRefresh as boolean,
      IdNameCodeModel.deserializeList
    ).pipe(tapWithAction(documents => (this.documents = documents)));
  }

  /* istanbul ignore next */
  public upsertDocument(request: IdNameCodeModel): Observable<IdNameCodeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.document, 'Document').pipe(
      map(response => IdNameCodeModel.deserialize(response)),
      tapWithAction((document: IdNameCodeModel) => {
        this.documents = Utilities.updateArray<IdNameCodeModel>(this.documents, document, {
          replace: !isNewRequest,
          predicate: t => t.id === document.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadPermissionLeadTimeTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.permissionLeadTimeType,
      this.permissionLeadTimeTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(response => (this.permissionLeadTimeTypes = response)));
  }

  /* istanbul ignore next */
  public upsertPermissionLeadTimeType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.permissionLeadTimeType, 'Lead Time Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.permissionLeadTimeTypes = Utilities.updateArray<SettingsTypeModel>(
          this.permissionLeadTimeTypes,
          response,
          {
            replace: !isNewRequest,
            predicate: t => t.id === response.id,
          }
        );
      })
    );
  }
}
