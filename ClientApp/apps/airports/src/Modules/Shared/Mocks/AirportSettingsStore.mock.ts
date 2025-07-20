import { AirportSettingsStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { IAPIAirportHoursSubTypes, AirportHoursSubTypeModel } from '../../Shared';
import { tap } from 'rxjs/operators';
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
} from '../Models';
import { IAPIAirportHoursRemarks, IAPIConditionTypeConfig } from '../Interfaces';
import {
  IAPIGridRequest,
  IAPIPageResponse,
  Utilities,
  tapWithAction,
  IdNameCodeModel,
  SettingsTypeModel,
  IDCodeModel,
} from '@wings-shared/core';
import { AirportModel, FARTypeModel } from '@wings/shared';

export class AirportSettingsStoreMock extends AirportSettingsStore {
  
  /* istanbul ignore next */
  public searchIcaoCode(searchValue: string): Observable<ICAOCodeModel[]> {
    return of([ new ICAOCodeModel(), new ICAOCodeModel() ]).pipe(
      tap((codes: ICAOCodeModel[]) => {
        this.ICAOCodes = codes;
      })
    );
  }
  public loadAirportHourTypes(forceRefresh?: boolean): Observable<AirportHoursTypeModel[]> {
    return of([ new AirportHoursTypeModel({ id: 1 }), new AirportHoursTypeModel() ]).pipe(
      tap((airportHourTypes: AirportHoursTypeModel[]) => {
        this.airportHourTypes = airportHourTypes;
      })
    );
  }

  public upsertAirportHourTypes(request: AirportHoursTypeModel): Observable<AirportHoursTypeModel> {
    return of(new AirportHoursTypeModel());
  }

  public loadAirportHourSubTypes(forceRefresh?: boolean): Observable<AirportHoursSubTypeModel[]> {
    return of([
      new AirportHoursSubTypeModel({ id: 1, airportHoursType: new AirportHoursTypeModel({ id: 1 }) }),
      new AirportHoursSubTypeModel({ id: 2 }),
    ]);
  }

  public upsertAirportHourSubTypes(
    airportHourSubTypes: AirportHoursSubTypeModel
  ): Observable<AirportHoursSubTypeModel> {
    return of(new AirportHoursSubTypeModel()).pipe(
      tap((airportHourSubType: AirportHoursSubTypeModel) => {
        this.airportHourSubTypes = Utilities.updateArray<AirportHoursSubTypeModel>(
          this.airportHourSubTypes,
          airportHourSubType,
          {
            replace: true,
            predicate: t => t.id === airportHourSubType.id,
          }
        );
      })
    );
  }

  public getAccessLevels(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((accessLevels: SettingsTypeModel[]) => {
        this.accessLevels = accessLevels;
      })
    );
  }

  public upsertAccessLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getSourceTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((sourceTypes: SettingsTypeModel[]) => {
        this.sourceTypes = sourceTypes;
      })
    );
  }

  public upsertSourceType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getConditionalOperators(forceRefresh?: boolean): Observable<ConditionalOperatorModel[]> {
    return of([ new ConditionalOperatorModel(), new ConditionalOperatorModel() ]).pipe(
      tap((conditionalOperators: ConditionalOperatorModel[]) => {
        this.conditionalOperators = conditionalOperators;
      })
    );
  }

  public upsertConditionalOperator(request: ConditionalOperatorModel): Observable<ConditionalOperatorModel> {
    return of(new ConditionalOperatorModel()).pipe(
      tap((conditionalOperator: ConditionalOperatorModel) => {
        this.conditionalOperators = Utilities.updateArray<ConditionalOperatorModel>(
          this.conditionalOperators,
          conditionalOperator,
          {
            replace: true,
            predicate: t => t.id === conditionalOperator.id,
          }
        );
      })
    );
  }

  public loadConditionTypes(forceRefresh?: boolean): Observable<ConditionTypeModel[]> {
    return of([ new ConditionTypeModel(), new ConditionTypeModel() ]).pipe(
      tap((conditionTypes: ConditionTypeModel[]) => {
        this.conditionTypes = conditionTypes;
      })
    );
  }

  public upsertConditionType(request: ConditionTypeModel): Observable<ConditionTypeModel> {
    return of(new ConditionTypeModel()).pipe(
      tap((conditionType: ConditionTypeModel) => {
        this.conditionTypes = Utilities.updateArray<ConditionTypeModel>(this.conditionTypes, conditionType, {
          replace: true,
          predicate: t => t.id === conditionType.id,
        });
      })
    );
  }

  public getAirportHoursRemarks(forceRefresh?: boolean): Observable<AirportHourRemarksModel[]> {
    return of([ new AirportHourRemarksModel(), new AirportHourRemarksModel() ]).pipe(
      tap((response: AirportHourRemarksModel[]) => {
        this.airportHoursRemarks = response;
      })
    );
  }

  public upsertAirportHourRemark(request: AirportHourRemarksModel): Observable<AirportHourRemarksModel> {
    return of(new AirportHourRemarksModel()).pipe(
      tapWithAction((airportHourRemark: AirportHourRemarksModel) => {
        this.airportHoursRemarks = Utilities.updateArray<AirportHourRemarksModel>(
          this.airportHoursRemarks,
          airportHourRemark,
          {
            replace: true,
            predicate: t => t.id === airportHourRemark.id,
          }
        );
      })
    );
  }

  public getSTDDSTTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((response: SettingsTypeModel[]) => {
        this.stddstTypes = response;
      })
    );
  }

  public loadScheduleTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((scheduleTypes: SettingsTypeModel[]) => {
        this.scheduleTypes = scheduleTypes;
      })
    );
  }

  public upsertScheduleType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((scheduleType: SettingsTypeModel) => {
        this.scheduleTypes = Utilities.updateArray<SettingsTypeModel>(this.scheduleTypes, scheduleType, {
          replace: true,
          predicate: t => t.id === scheduleType.id,
        });
      })
    );
  }

  public loadAirportTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((airportTypes: SettingsTypeModel[]) => {
        this.airportTypes = airportTypes;
      })
    );
  }

  public upsertAirportType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((airportType: SettingsTypeModel) => {
        this.airportTypes = Utilities.updateArray<SettingsTypeModel>(this.airportTypes, airportType, {
          replace: true,
          predicate: t => t.id === airportType.id,
        });
      })
    );
  }

  public loadAirportFacilityTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((airportFacilityTypes: SettingsTypeModel[]) => {
        this.airportFacilityTypes = airportFacilityTypes;
      })
    );
  }

  public upsertAirportFacilityType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((airportFacilityType: SettingsTypeModel) => {
        this.airportFacilityTypes = Utilities.updateArray<SettingsTypeModel>(
          this.airportFacilityTypes,
          airportFacilityType,
          {
            replace: true,
            predicate: t => t.id === airportFacilityType.id,
          }
        );
      })
    );
  }

  public loadDistanceUOMs(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((distanceUOMs: SettingsTypeModel[]) => {
        this.distanceUOMs = distanceUOMs;
      })
    );
  }

  public upsertDistanceUOM(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((distanceUOM: SettingsTypeModel) => {
        this.distanceUOMs = Utilities.updateArray<SettingsTypeModel>(this.distanceUOMs, distanceUOM, {
          replace: true,
          predicate: t => t.id === distanceUOM.id,
        });
      })
    );
  }

  public loadAirportDirections(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((airportDirections: SettingsTypeModel[]) => {
        this.airportDirections = airportDirections;
      })
    );
  }

  public upsertAirportDirection(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((airportDirection: SettingsTypeModel) => {
        this.airportDirections = Utilities.updateArray<SettingsTypeModel>(this.airportDirections, airportDirection, {
          replace: true,
          predicate: t => t.id === airportDirection.id,
        });
      })
    );
  }

  public loadAirportUsageTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((airportUsageTypes: SettingsTypeModel[]) => {
        this.airportUsageTypes = airportUsageTypes;
      })
    );
  }

  public upsertAirportUsageType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((airportUsageType: SettingsTypeModel) => {
        this.airportUsageTypes = Utilities.updateArray<SettingsTypeModel>(this.airportUsageTypes, airportUsageType, {
          replace: true,
          predicate: t => t.id === airportUsageType.id,
        });
      })
    );
  }

  public loadAirportFacilityAccessLevels(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((airportFacilityAccessLevels: SettingsTypeModel[]) => {
        this.airportFacilityAccessLevels = airportFacilityAccessLevels;
      })
    );
  }

  public upsertAirportFacilityAccessLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((airportFacilityAccessLevel: SettingsTypeModel) => {
        this.airportFacilityAccessLevels = Utilities.updateArray<SettingsTypeModel>(
          this.airportFacilityAccessLevels,
          airportFacilityAccessLevel,
          {
            replace: true,
            predicate: t => t.id === airportFacilityAccessLevel.id,
          }
        );
      })
    );
  }

  public loadICAOCodes(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<ICAOCodeModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new ICAOCodeModel() ],
    }).pipe(tapWithAction(response => (this.ICAOCodes = response.results)));
  }

  public upsertICAOCode(request: ICAOCodeModel): Observable<ICAOCodeModel> {
    return of(new ICAOCodeModel()).pipe(
      tapWithAction((ICAOCode: ICAOCodeModel) => {
        this.ICAOCodes = Utilities.updateArray<ICAOCodeModel>(this.ICAOCodes, ICAOCode, {
          replace: true,
          predicate: t => t.id === ICAOCode.id,
        });
      })
    );
  }

  public loadRegionalCodes(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<AirportCodeSettingsModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new AirportCodeSettingsModel() ],
    }).pipe(tapWithAction(response => (this.regionalCodes = response.results)));
  }

  public upsertRegionalCode(request: AirportCodeSettingsModel): Observable<AirportCodeSettingsModel> {
    return of(new AirportCodeSettingsModel()).pipe(
      tapWithAction((regionalCode: AirportCodeSettingsModel) => {
        this.regionalCodes = Utilities.updateArray<AirportCodeSettingsModel>(this.regionalCodes, regionalCode, {
          replace: true,
          predicate: t => t.id === regionalCode.id,
        });
      })
    );
  }

  public loadUwaCodes(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<AirportCodeSettingsModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new AirportCodeSettingsModel() ],
    }).pipe(tapWithAction(response => (this.uwaCodes = response.results)));
  }

  public upsertUwaCode(request: AirportCodeSettingsModel): Observable<AirportCodeSettingsModel> {
    return of(new AirportCodeSettingsModel()).pipe(
      tapWithAction((uwaCode: AirportCodeSettingsModel) => {
        this.uwaCodes = Utilities.updateArray<AirportCodeSettingsModel>(this.uwaCodes, uwaCode, {
          replace: true,
          predicate: t => t.id === uwaCode.id,
        });
      })
    );
  }

  public loadAirportHourBuffers(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<AirportHoursBufferModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new AirportHoursBufferModel() ],
    }).pipe(tapWithAction(response => (this.airportHourBuffers = response.results)));
  }

  public upsertAirportHourBuffer(request: AirportHoursBufferModel): Observable<AirportHoursBufferModel> {
    return of(new AirportHoursBufferModel()).pipe(
      tap((airportHourBuffers: AirportHoursBufferModel) => {
        this.airportHourBuffers = Utilities.updateArray<AirportHoursBufferModel>(
          this.airportHourBuffers,
          airportHourBuffers,
          {
            replace: true,
            predicate: t => t.id === airportHourBuffers.id,
          }
        );
      })
    );
  }

  public loadMilitaryUseTypes(): Observable<IAPIPageResponse<MilitaryUseTypeModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new MilitaryUseTypeModel() ],
    }).pipe(tapWithAction(response => response.results));
  }

  public loadAirportDataSources(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((dataSources: SettingsTypeModel[]) => {
        this.airportDataSources = dataSources;
      })
    );
  }

  public upsertAirportDataSource(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((dataSource: SettingsTypeModel) => {
        this.airportDataSources = Utilities.updateArray<SettingsTypeModel>(this.airportDataSources, dataSource, {
          replace: true,
          predicate: t => t.id === dataSource.id,
        });
      })
    );
  }

  public loadRunwaySurfaceTypes(forceRefresh?: boolean): Observable<RunwaySurfaceTypeModel[]> {
    return of([ new RunwaySurfaceTypeModel(), new RunwaySurfaceTypeModel() ]).pipe(
      tapWithAction((runwaySurfaceTypes: RunwaySurfaceTypeModel[]) => {
        this.runwaySurfaceTypes = runwaySurfaceTypes;
      })
    );
  }

  public upsertRunwaySurfaceType(request: RunwaySurfaceTypeModel): Observable<RunwaySurfaceTypeModel> {
    return of(new RunwaySurfaceTypeModel()).pipe(
      tapWithAction((runwaySurfaceType: RunwaySurfaceTypeModel) => {
        this.runwaySurfaceTypes = Utilities.updateArray<RunwaySurfaceTypeModel>(
          this.runwaySurfaceTypes,
          runwaySurfaceType,
          {
            replace: true,
            predicate: t => t.id === runwaySurfaceType.id,
          }
        );
      })
    );
  }

  public loadRunwayConditions(forceRefresh?: boolean): Observable<RunwaySettingsTypeModel[]> {
    return of([ new RunwaySettingsTypeModel(), new RunwaySettingsTypeModel() ]).pipe(
      tapWithAction((runwayConditions: RunwaySettingsTypeModel[]) => {
        this.runwayConditions = runwayConditions;
      })
    );
  }

  public upsertRunwayCondition(request: RunwaySettingsTypeModel): Observable<RunwaySettingsTypeModel> {
    return of(new RunwaySettingsTypeModel()).pipe(
      tapWithAction((runwayCondition: RunwaySettingsTypeModel) => {
        this.runwayConditions = Utilities.updateArray<RunwaySettingsTypeModel>(this.runwayConditions, runwayCondition, {
          replace: true,
          predicate: t => t.id === runwayCondition.id,
        });
      })
    );
  }

  public loadRunwaySurfaceTreatments(forceRefresh?: boolean): Observable<RunwaySettingsTypeModel[]> {
    return of([ new RunwaySettingsTypeModel(), new RunwaySettingsTypeModel() ]).pipe(
      tapWithAction((runwaySurfaceTreatments: RunwaySettingsTypeModel[]) => {
        this.runwaySurfaceTreatments = runwaySurfaceTreatments;
      })
    );
  }

  public upsertRunwaySurfaceTreatment(request: RunwaySettingsTypeModel): Observable<RunwaySettingsTypeModel> {
    return of(new RunwaySettingsTypeModel()).pipe(
      tapWithAction((runwaySurfaceTreatment: RunwaySettingsTypeModel) => {
        this.runwaySurfaceTreatments = Utilities.updateArray<RunwaySettingsTypeModel>(
          this.runwaySurfaceTreatments,
          runwaySurfaceTreatment,
          {
            replace: true,
            predicate: t => t.id === runwaySurfaceTreatment.id,
          }
        );
      })
    );
  }

  public loadRunwayLightTypes(forceRefresh?: boolean): Observable<RunwayLightTypeModel[]> {
    return of([ new RunwayLightTypeModel(), new RunwayLightTypeModel() ]).pipe(
      tapWithAction((runwayLightTypes: RunwayLightTypeModel[]) => {
        this.runwayLightTypes = runwayLightTypes;
      })
    );
  }

  public upsertRunwayLightType(request: RunwayLightTypeModel): Observable<RunwayLightTypeModel> {
    return of(new RunwayLightTypeModel()).pipe(
      tapWithAction((runwayLightType: RunwayLightTypeModel) => {
        this.runwayLightTypes = Utilities.updateArray<RunwayLightTypeModel>(this.runwayLightTypes, runwayLightType, {
          replace: true,
          predicate: t => t.id === runwayLightType.id,
        });
      })
    );
  }

  public loadRunwayRVR(forceRefresh?: boolean): Observable<RunwaySettingsTypeModel[]> {
    return of([ new RunwaySettingsTypeModel(), new RunwaySettingsTypeModel() ]).pipe(
      tapWithAction((runwayRVR: RunwaySettingsTypeModel[]) => {
        this.runwayRVR = runwayRVR;
      })
    );
  }

  public upsertRunwayRVR(request: RunwaySettingsTypeModel): Observable<RunwaySettingsTypeModel> {
    return of(new RunwaySettingsTypeModel()).pipe(
      tapWithAction((runwayRVR: RunwaySettingsTypeModel) => {
        this.runwayRVR = Utilities.updateArray<RunwaySettingsTypeModel>(this.runwayRVR, runwayRVR, {
          replace: true,
          predicate: t => t.id === runwayRVR.id,
        });
      })
    );
  }

  public loadRunwayApproachLight(forceRefresh?: boolean): Observable<RunwaySettingsTypeModel[]> {
    return of([ new RunwaySettingsTypeModel(), new RunwaySettingsTypeModel() ]).pipe(
      tapWithAction((runwayApproachLight: RunwaySettingsTypeModel[]) => {
        this.runwayApproachLight = runwayApproachLight;
      })
    );
  }

  public upsertRunwayApproachLight(request: RunwaySettingsTypeModel): Observable<RunwaySettingsTypeModel> {
    return of(new RunwaySettingsTypeModel()).pipe(
      tapWithAction((runwayApproachLight: RunwaySettingsTypeModel) => {
        this.runwayApproachLight = Utilities.updateArray<RunwaySettingsTypeModel>(
          this.runwayApproachLight,
          runwayApproachLight,
          {
            replace: true,
            predicate: t => t.id === runwayApproachLight.id,
          }
        );
      })
    );
  }

  public loadRunwayVGSI(forceRefresh?: boolean): Observable<RunwaySettingsTypeModel[]> {
    return of([ new RunwaySettingsTypeModel(), new RunwaySettingsTypeModel() ]).pipe(
      tapWithAction((runwayVGSI: RunwaySettingsTypeModel[]) => {
        this.runwayVGSI = runwayVGSI;
      })
    );
  }

  public upsertRunwayVGSI(request: RunwaySettingsTypeModel): Observable<RunwaySettingsTypeModel> {
    return of(new RunwaySettingsTypeModel()).pipe(
      tapWithAction((runwayVGSI: RunwaySettingsTypeModel) => {
        this.runwayVGSI = Utilities.updateArray<RunwaySettingsTypeModel>(this.runwayVGSI, runwayVGSI, {
          replace: true,
          predicate: t => t.id === runwayVGSI.id,
        });
      })
    );
  }

  public loadWeatherReportingSystem(forceRefresh?: boolean): Observable<AirportCodeSettingsModel[]> {
    return of([ new AirportCodeSettingsModel(), new AirportCodeSettingsModel() ]).pipe(
      tapWithAction((weatherReportingSystem: AirportCodeSettingsModel[]) => {
        this.weatherReportingSystem = weatherReportingSystem;
      })
    );
  }

  public upsertWeatherReportingSystem(request: AirportCodeSettingsModel): Observable<AirportCodeSettingsModel> {
    return of(new AirportCodeSettingsModel()).pipe(
      tapWithAction((weatherReportingSystem: AirportCodeSettingsModel) => {
        this.weatherReportingSystem = Utilities.updateArray<AirportCodeSettingsModel>(
          this.weatherReportingSystem,
          weatherReportingSystem,
          {
            replace: true,
            predicate: t => t.id === weatherReportingSystem.id,
          }
        );
      })
    );
  }

  public loadRunwayNavaids(forceRefresh?: boolean): Observable<RunwaySettingsTypeModel[]> {
    return of([ new RunwaySettingsTypeModel(), new RunwaySettingsTypeModel() ]).pipe(
      tapWithAction((runwayNavaids: RunwaySettingsTypeModel[]) => {
        this.runwayNavaids = runwayNavaids;
      })
    );
  }

  public upsertRunwayNavaids(request: RunwaySettingsTypeModel): Observable<RunwaySettingsTypeModel> {
    return of(new RunwaySettingsTypeModel()).pipe(
      tapWithAction((runwayNavaids: RunwaySettingsTypeModel) => {
        this.runwayNavaids = Utilities.updateArray<RunwaySettingsTypeModel>(this.runwayNavaids, runwayNavaids, {
          replace: true,
          predicate: t => t.id === runwayNavaids.id,
        });
      })
    );
  }

  public loadRunwayApproachType(forceRefresh?: boolean): Observable<RunwaySettingsTypeModel[]> {
    return of([ new RunwaySettingsTypeModel(), new RunwaySettingsTypeModel() ]).pipe(
      tapWithAction((runwayApproachType: RunwaySettingsTypeModel[]) => {
        this.runwayApproachType = runwayApproachType;
      })
    );
  }

  public upsertRunwayApproachType(request: RunwaySettingsTypeModel): Observable<RunwaySettingsTypeModel> {
    return of(new RunwaySettingsTypeModel()).pipe(
      tapWithAction((runwayApproachType: RunwaySettingsTypeModel) => {
        this.runwayApproachType = Utilities.updateArray<RunwaySettingsTypeModel>(
          this.runwayApproachType,
          runwayApproachType,
          {
            replace: true,
            predicate: t => t.id === runwayApproachType.id,
          }
        );
      })
    );
  }

  public loadRunwayUsageTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((runwayUsageTypes: SettingsTypeModel[]) => {
        this.runwayUsageTypes = runwayUsageTypes;
      })
    );
  }

  public upsertRunwayUsageType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((runwayUsageType: SettingsTypeModel) => {
        this.runwayUsageTypes = Utilities.updateArray<SettingsTypeModel>(this.runwayUsageTypes, runwayUsageType, {
          replace: true,
          predicate: t => t.id === runwayUsageType.id,
        });
      })
    );
  }

  public loadAirportOfEntries(): Observable<IAPIPageResponse<IdNameCodeModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new IdNameCodeModel() ],
    }).pipe(tapWithAction(response => response.results));
  }

  public upsertAirportOfEntry(request: IdNameCodeModel): Observable<IdNameCodeModel> {
    return of(new IdNameCodeModel()).pipe(
      tapWithAction((airportOfEntry: IdNameCodeModel) => {
        this.airportOfEntry = Utilities.updateArray<IdNameCodeModel>(this.airportOfEntry, airportOfEntry, {
          replace: true,
          predicate: t => t.id === airportOfEntry.id,
        });
      })
    );
  }

  public loadAirportCategory(forceRefresh?: boolean): Observable<AirportCategoryModel[]> {
    return of([ new AirportCategoryModel(), new AirportCategoryModel() ]).pipe(
      tapWithAction((airportCategory: AirportCategoryModel[]) => {
        this.airportCategory = airportCategory;
      })
    );
  }

  /* istanbul ignore next */
  public upsertAirportCategory(request: AirportCategoryModel): Observable<AirportCategoryModel> {
    return of(new AirportCategoryModel()).pipe(
      tapWithAction((category: AirportCategoryModel) => {
        this.airportCategory = Utilities.updateArray<AirportCategoryModel>(this.airportCategory, category, {
          replace: true,
          predicate: t => t.id === category.id,
        });
      })
    );
  }

  public loadClassCode(forceRefresh?: boolean): Observable<AirportCodeSettingsModel[]> {
    return of([ new AirportCodeSettingsModel(), new AirportCodeSettingsModel() ]).pipe(
      tapWithAction((airportClassCode: AirportCodeSettingsModel[]) => {
        this.airportClassCode = airportClassCode;
      })
    );
  }

  /* istanbul ignore next */
  public upsertClassCode(request: AirportCodeSettingsModel): Observable<AirportCodeSettingsModel> {
    return of(new AirportCodeSettingsModel()).pipe(
      tapWithAction((code: AirportCodeSettingsModel) => {
        this.airportClassCode = Utilities.updateArray<AirportCodeSettingsModel>(this.airportClassCode, code, {
          replace: true,
          predicate: t => t.id === code.id,
        });
      })
    );
  }

  public loadCertificateCode(forceRefresh?: boolean): Observable<AirportCodeSettingsModel[]> {
    return of([ new AirportCodeSettingsModel(), new AirportCodeSettingsModel() ]).pipe(
      tapWithAction((airportCertificateCode: AirportCodeSettingsModel[]) => {
        this.airportCertificateCode = airportCertificateCode;
      })
    );
  }

  /* istanbul ignore next */
  public upsertCertificateCode(request: AirportCodeSettingsModel): Observable<AirportCodeSettingsModel> {
    return of(new AirportCodeSettingsModel()).pipe(
      tapWithAction((code: AirportCodeSettingsModel) => {
        this.airportCertificateCode = Utilities.updateArray<AirportCodeSettingsModel>(
          this.airportCertificateCode,
          code,
          {
            replace: true,
            predicate: t => t.id === code.id,
          }
        );
      })
    );
  }

  public loadServiceCode(forceRefresh?: boolean): Observable<AirportCodeSettingsModel[]> {
    return of([ new AirportCodeSettingsModel(), new AirportCodeSettingsModel() ]).pipe(
      tapWithAction((airportServiceCode: AirportCodeSettingsModel[]) => {
        this.airportServiceCode = airportServiceCode;
      })
    );
  }

  /* istanbul ignore next */
  public upsertServiceCode(request: AirportCodeSettingsModel): Observable<AirportCodeSettingsModel> {
    return of(new AirportCodeSettingsModel()).pipe(
      tapWithAction((code: AirportCodeSettingsModel) => {
        this.airportServiceCode = Utilities.updateArray<AirportCodeSettingsModel>(this.airportServiceCode, code, {
          replace: true,
          predicate: t => t.id === code.id,
        });
      })
    );
  }

  public loadFrequencyTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((frequencyTypes: SettingsTypeModel[]) => {
        this.frequencyTypes = frequencyTypes;
      })
    );
  }

  public upsertFrequencyType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((frequencyType: SettingsTypeModel) => {
        this.frequencyTypes = Utilities.updateArray<SettingsTypeModel>(this.frequencyTypes, frequencyType, {
          replace: true,
          predicate: t => t.id === frequencyType.id,
        });
      })
    );
  }

  public loadSectors(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((sectors: SettingsTypeModel[]) => {
        this.sectors = sectors;
      })
    );
  }

  public upsertSector(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((sector: SettingsTypeModel) => {
        this.sectors = Utilities.updateArray<SettingsTypeModel>(this.sectors, sector, {
          replace: true,
          predicate: t => t.id === sector.id,
        });
      })
    );
  }

  public loadDestinationAlternateTOFs(forceRefresh?: boolean): Observable<IdNameCodeModel[]> {
    return of([ new IdNameCodeModel(), new IdNameCodeModel() ]).pipe(
      tapWithAction((flights: IdNameCodeModel[]) => {
        this.destinationAlternateTOFs = flights;
      })
    );
  }

  public upsertDestinationAlternateTOF(request: IdNameCodeModel): Observable<IdNameCodeModel> {
    return of(new IdNameCodeModel()).pipe(
      tapWithAction((flight: IdNameCodeModel) => {
        this.destinationAlternateTOFs = Utilities.updateArray<IdNameCodeModel>(this.destinationAlternateTOFs, flight, {
          replace: true,
          predicate: t => t.id === flight.id,
        });
      })
    );
  }

  public removeDestinationAlternateTOF(request: IdNameCodeModel): Observable<string> {
    return of('Destination Alternate Type Of Flight deleted successfully!');
  }

  public loadNoiseClassifications(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.noiseClassifications = response;
      })
    );
  }

  public upsertNoiseClassification(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((response: SettingsTypeModel) => {
        this.noiseClassifications = Utilities.updateArray<SettingsTypeModel>(this.noiseClassifications, response, {
          replace: true,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadConditionTypeConfig(forceRefresh?: boolean): Observable<ConditionTypeConfigModel[]> {
    return of([ new ConditionTypeConfigModel(), new ConditionTypeConfigModel() ]).pipe(
      tapWithAction((response: ConditionTypeConfigModel[]) => {
        this.conditionTypeConfig = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertConditionTypeConfig(model: ConditionTypeConfigModel): Observable<ConditionTypeConfigModel> {
    return of(new ConditionTypeConfigModel()).pipe(
      tapWithAction((type: ConditionTypeConfigModel) => {
        this.conditionTypeConfig = Utilities.updateArray<ConditionTypeConfigModel>(this.conditionTypeConfig, type, {
          replace: true,
          predicate: t => t.id === type.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadFlightType(forceRefresh?: boolean): Observable<IDCodeModel[]> {
    return of([ new IDCodeModel(), new IDCodeModel() ]).pipe(
      tapWithAction((response: IDCodeModel[]) => {
        this.flightType = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertFlightType(request: IDCodeModel): Observable<IDCodeModel> {
    return of(new IDCodeModel()).pipe(
      tapWithAction((flight: IDCodeModel) => {
        this.flightType = Utilities.updateArray<IDCodeModel>(this.flightType, flight, {
          replace: true,
          predicate: t => t.id === flight.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadOvertime(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.overtime = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertOvertime(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((time: SettingsTypeModel) => {
        this.overtime = Utilities.updateArray<SettingsTypeModel>(this.overtime, time, {
          replace: true,
          predicate: t => t.id === time.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadSecurityMeasures(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.securityMeasures = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertSecurityMeasures(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((security: SettingsTypeModel) => {
        this.securityMeasures = Utilities.updateArray<SettingsTypeModel>(this.securityMeasures, security, {
          replace: true,
          predicate: t => t.id === security.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRecommendedServices(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.recommendedServices = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertRecommendedServices(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((service: SettingsTypeModel) => {
        this.recommendedServices = Utilities.updateArray<SettingsTypeModel>(this.recommendedServices, service, {
          replace: true,
          predicate: t => t.id === service.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRampSideAccessThirdPartyVendors(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.rampSideAccess3rdPartyVendors = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertRampSideAccessThirdPartyVendors(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((vendor: SettingsTypeModel) => {
        this.rampSideAccess3rdPartyVendors = Utilities.updateArray<SettingsTypeModel>(
          this.rampSideAccess3rdPartyVendors,
          vendor,
          {
            replace: true,
            predicate: t => t.id === vendor.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadRampSideAccessThirdParty(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.rampSideAccess3rdParty = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertRampSideAccessThirdParty(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((vendor: SettingsTypeModel) => {
        this.rampSideAccess3rdParty = Utilities.updateArray<SettingsTypeModel>(this.rampSideAccess3rdParty, vendor, {
          replace: true,
          predicate: t => t.id === vendor.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRampSideAccess(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.rampSideAccess = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertRampSideAccess(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((access: SettingsTypeModel) => {
        this.rampSideAccess = Utilities.updateArray<SettingsTypeModel>(this.rampSideAccess, access, {
          replace: true,
          predicate: t => t.id === access.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadVisaTimings(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.visaTimings = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertVisaTiming(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((timing: SettingsTypeModel) => {
        this.visaTimings = Utilities.updateArray<SettingsTypeModel>(this.visaTimings, timing, {
          replace: true,
          predicate: t => t.id === timing.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadFuelTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.fuelTypes = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertFuelTypes(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((type: SettingsTypeModel) => {
        this.fuelTypes = Utilities.updateArray<SettingsTypeModel>(this.fuelTypes, type, {
          replace: true,
          predicate: t => t.id === type.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadOilTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.oilTypes = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertOilTypes(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((type: SettingsTypeModel) => {
        this.oilTypes = Utilities.updateArray<SettingsTypeModel>(this.oilTypes, type, {
          replace: true,
          predicate: t => t.id === type.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadAreaPortAssignments(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.areaPortAssignments = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertAreaPortAssignment(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((assignment: SettingsTypeModel) => {
        this.areaPortAssignments = Utilities.updateArray<SettingsTypeModel>(this.areaPortAssignments, assignment, {
          replace: true,
          predicate: t => t.id === assignment.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadRequiredInformationTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.requiredInformationTypes = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertRequiredInformationType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((type: SettingsTypeModel) => {
        this.requiredInformationTypes = Utilities.updateArray<SettingsTypeModel>(this.requiredInformationTypes, type, {
          replace: true,
          predicate: t => t.id === type.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadFieldOfficeOversights(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.fieldOfficeOversights = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertFieldOfficeOversight(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((oversight: SettingsTypeModel) => {
        this.fieldOfficeOversights = Utilities.updateArray<SettingsTypeModel>(this.fieldOfficeOversights, oversight, {
          replace: true,
          predicate: t => t.id === oversight.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadCustomsLocationInformation(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.customsLocationInformation = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertCustomsLocationInformation(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((location: SettingsTypeModel) => {
        this.customsLocationInformation = Utilities.updateArray<SettingsTypeModel>(
          this.customsLocationInformation,
          location,
          {
            replace: true,
            predicate: t => t.id === location.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadMaxPOBOptions(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.maxPOBOptions = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertMaxPOBOption(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((option: SettingsTypeModel) => {
        this.maxPOBOptions = Utilities.updateArray<SettingsTypeModel>(this.maxPOBOptions, option, {
          replace: true,
          predicate: t => t.id === option.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadCbpPortTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.cbpPortTypes = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertCbpPortType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((type: SettingsTypeModel) => {
        this.cbpPortTypes = Utilities.updateArray<SettingsTypeModel>(this.cbpPortTypes, type, {
          replace: true,
          predicate: t => t.id === type.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadICAOAuditHistory(code: string): Observable<AirportModel[]> {
    return of([ new AirportModel(), new AirportModel() ]);
  }

  /* istanbul ignore next */
  public loadOvernightParkings(
    forceRefresh?: boolean
  ): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.overnightParkings = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertOvernightParking(
    request: SettingsTypeModel
  ): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((type: SettingsTypeModel) => {
        this.overnightParkings = Utilities.updateArray<SettingsTypeModel>(
          this.overnightParkings,
          type,
          {
            replace: true,
            predicate: (t) => t.id === type.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadCustomsContactTypes(
    forceRefresh?: boolean
  ): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.customsContactTypes = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertCustomsContactType(
    request: SettingsTypeModel
  ): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((type: SettingsTypeModel) => {
        this.customsContactTypes = Utilities.updateArray<SettingsTypeModel>(
          this.customsContactTypes,
          type,
          {
            replace: true,
            predicate: (t) => t.id === type.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadCustomsContactAddressTypes(
    forceRefresh?: boolean
  ): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.customsContactAddressTypes = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertCustomsContactAddressType(
    request: SettingsTypeModel
  ): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((type: SettingsTypeModel) => {
        this.customsContactAddressTypes =
          Utilities.updateArray<SettingsTypeModel>(
            this.customsContactAddressTypes,
            type,
            {
              replace: true,
              predicate: (t) => t.id === type.id,
            }
          );
      })
    );
  }

  /* istanbul ignore next */
  public loadLargeAircraftRestriction(
    forceRefresh?: boolean
  ): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.largeAircraftRestriction = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertLargeAircraftRestriction(
    request: SettingsTypeModel
  ): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((type: SettingsTypeModel) => {
        this.largeAircraftRestriction =
          Utilities.updateArray<SettingsTypeModel>(
            this.largeAircraftRestriction,
            type,
            {
              replace: true,
              predicate: (t) => t.id === type.id,
            }
          );
      })
    );
  }

  /* istanbul ignore next */
  public loadLeadTimeType(
    forceRefresh?: boolean
  ): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.leadTimeType = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertLeadTimeType(
    request: SettingsTypeModel
  ): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((type: SettingsTypeModel) => {
        this.leadTimeType = Utilities.updateArray<SettingsTypeModel>(
          this.leadTimeType,
          type,
          {
            replace: true,
            predicate: (t) => t.id === type.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadNoteTypes(
    forceRefresh?: boolean
  ): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((response: SettingsTypeModel[]) => {
        this.noteTypes = response;
      })
    );
  }

  /* istanbul ignore next */
  public upsertNoteType(
    request: SettingsTypeModel
  ): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((type: SettingsTypeModel) => {
        this.noteTypes = Utilities.updateArray<SettingsTypeModel>(
          this.noteTypes,
          type,
          {
            replace: true,
            predicate: (t) => t.id === type.id,
          }
        );
      })
    );
  }

  public getAircraftVariations(request?: IAPIGridRequest): Observable<IAPIPageResponse<IdNameCodeModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new IdNameCodeModel() ],
    }).pipe(tapWithAction(response => (this.aircraftVariations = response.results)));
  }

  public getFarTypes(forceRefresh?: boolean): Observable<FARTypeModel[]> {
    return of([ new FARTypeModel(), new FARTypeModel() ]).pipe(
      tapWithAction((response: FARTypeModel[]) => {
        this.farTypes = response;
      })
    );
  }
}
