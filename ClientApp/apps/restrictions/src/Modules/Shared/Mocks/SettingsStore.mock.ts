import { SettingsStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { FARTypeModel } from '@wings/shared';
import { tap } from 'rxjs/operators';
import { RestrictionSourceModel, TraveledHistorySubCategoryModel, UWAAllowableActionModel } from '../Models';
import { Utilities, tapWithAction, IdNameCodeModel, SettingsTypeModel } from '@wings-shared/core';

export class SettingsStoreMock extends SettingsStore {
  public getFarTypes(): Observable<FARTypeModel[]> {
    return of([ new FARTypeModel(), new FARTypeModel() ]).pipe(
      tap((farTypes: FARTypeModel[]) => {
        this.farTypes = farTypes;
      })
    );
  }

  public getSourceTypes(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((sourceTypes: SettingsTypeModel[]) => {
        this.sourceTypes = sourceTypes;
      })
    );
  }

  public upsertSourceType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((sourceType: SettingsTypeModel) => {
        this.sourceTypes = Utilities.updateArray<SettingsTypeModel>(this.sourceTypes, sourceType, {
          replace: true,
          predicate: t => t.id === sourceType.id,
        });
      })
    );
  }

  public getAccessLevels(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((accessLevels: SettingsTypeModel[]) => {
        this.accessLevels = accessLevels;
      })
    );
  }

  public upsertAccessLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((accessLevel: SettingsTypeModel) => {
        this.accessLevels = Utilities.updateArray<SettingsTypeModel>(this.accessLevels, accessLevel, {
          replace: true,
          predicate: t => t.id === accessLevel.id,
        });
      })
    );
  }

  public getUWAAllowableActions(): Observable<UWAAllowableActionModel[]> {
    return of([ new UWAAllowableActionModel(), new UWAAllowableActionModel() ]).pipe(
      tap((uwaAllowableActions: UWAAllowableActionModel[]) => {
        this.uwaAllowableActions = uwaAllowableActions;
      })
    );
  }

  public upsertUWAAllowableAction(request: UWAAllowableActionModel): Observable<UWAAllowableActionModel> {
    return of(new UWAAllowableActionModel()).pipe(
      tap((uwaAllowableAction: UWAAllowableActionModel) => {
        this.uwaAllowableActions = Utilities.updateArray<UWAAllowableActionModel>(
          this.uwaAllowableActions,
          uwaAllowableAction,
          {
            replace: true,
            predicate: t => t.id === uwaAllowableAction.id,
          }
        );
      })
    );
  }

  public getLandingOrOverflights(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((landingOrOverflights: SettingsTypeModel[]) => {
        this.landingOrOverflights = landingOrOverflights;
      })
    );
  }

  public upsertLandingOrOverflight(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((landingOrOverflight: SettingsTypeModel) => {
        this.landingOrOverflights = Utilities.updateArray<SettingsTypeModel>(
          this.landingOrOverflights,
          landingOrOverflight,
          {
            replace: true,
            predicate: t => t.id === landingOrOverflight.id,
          }
        );
      })
    );
  }

  public getRestrictionTypes(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((restrictionTypes: SettingsTypeModel[]) => {
        this.restrictionTypes = restrictionTypes;
      })
    );
  }

  public upsertRestrictionType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((restrictionType: SettingsTypeModel) => {
        this.restrictionTypes = Utilities.updateArray<SettingsTypeModel>(this.restrictionTypes, restrictionType, {
          replace: true,
          predicate: t => t.id === restrictionType.id,
        });
      })
    );
  }

  public getApprovalTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((approvalTypes: SettingsTypeModel[]) => {
        this.approvalTypes = approvalTypes;
      })
    );
  }

  public upsertApprovalType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((approvalType: SettingsTypeModel) => {
        this.approvalTypes = Utilities.updateArray<SettingsTypeModel>(this.approvalTypes, approvalType, {
          replace: true,
          predicate: t => t.id === approvalType.id,
        });
      })
    );
  }

  public getRestrictionApplies(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((restrictionApplies: SettingsTypeModel[]) => {
        this.restrictionApplies = restrictionApplies;
      })
    );
  }

  public upsertRestrictionApply(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((restrictionApply: SettingsTypeModel) => {
        this.restrictionApplies = Utilities.updateArray<SettingsTypeModel>(this.restrictionApplies, restrictionApply, {
          replace: true,
          predicate: t => t.id === restrictionApply.id,
        });
      })
    );
  }

  public getRestrictionSources(forceRefresh?: boolean): Observable<RestrictionSourceModel[]> {
    return of([ new RestrictionSourceModel(), new RestrictionSourceModel() ]).pipe(
      tap((restrictionSources: RestrictionSourceModel[]) => {
        this.restrictionSources = restrictionSources;
      })
    );
  }

  public upsertRestrictionSource(request: RestrictionSourceModel): Observable<RestrictionSourceModel> {
    return of(new RestrictionSourceModel()).pipe(
      tap((restrictionSource: RestrictionSourceModel) => {
        this.restrictionSources = Utilities.updateArray<RestrictionSourceModel>(
          this.restrictionSources,
          restrictionSource,
          {
            replace: true,
            predicate: t => t.id === restrictionSource.id,
          }
        );
      })
    );
  }

  public getRestrictionLevels(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((restrictionLevels: SettingsTypeModel[]) => {
        this.restrictionLevels = restrictionLevels;
      })
    );
  }

  public upsertRestrictionLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((restrictionLevel: SettingsTypeModel) => {
        this.restrictionLevels = Utilities.updateArray<SettingsTypeModel>(this.restrictionLevels, restrictionLevel, {
          replace: true,
          predicate: t => t.id === restrictionLevel.id,
        });
      })
    );
  }

  public getHealthForms(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((healthForms: SettingsTypeModel[]) => {
        this.healthForms = healthForms;
      })
    );
  }

  public upsertHealthForm(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((healthform: SettingsTypeModel) => {
        this.healthForms = Utilities.updateArray<SettingsTypeModel>(this.healthForms, healthform, {
          replace: true,
          predicate: t => t.id === healthform.id,
        });
      })
    );
  }

  public getTestTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((testTypes: SettingsTypeModel[]) => {
        this.testTypes = testTypes;
      })
    );
  }

  public upsertTestType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((testType: SettingsTypeModel) => {
        this.testTypes = Utilities.updateArray<SettingsTypeModel>(this.restrictionLevels, testType, {
          replace: true,
          predicate: t => t.id === testType.id,
        });
      })
    );
  }

  public getLeadTimeIndicators(forceRefresh?: boolean): Observable<IdNameCodeModel[]> {
    return of([ new IdNameCodeModel(), new IdNameCodeModel() ]).pipe(
      tap((leadTimeIndicators: IdNameCodeModel[]) => {
        this.leadTimeIndicators = leadTimeIndicators;
      })
    );
  }

  public upsertLeadTimeIndicator(request: IdNameCodeModel): Observable<IdNameCodeModel> {
    return of(new IdNameCodeModel()).pipe(
      tap((leadTimeIndicator: IdNameCodeModel) => {
        this.leadTimeIndicators = Utilities.updateArray<IdNameCodeModel>(this.leadTimeIndicators, leadTimeIndicator, {
          replace: true,
          predicate: t => t.id === leadTimeIndicator.id,
        });
      })
    );
  }

  public getFlightsAllowed(forceRefresh?: boolean): Observable<IdNameCodeModel[]> {
    return of([ new IdNameCodeModel(), new IdNameCodeModel() ]).pipe(
      tap((flightsAllowed: IdNameCodeModel[]) => {
        this.flightsAllowed = flightsAllowed;
      })
    );
  }

  public upsertFlightAllowed(request: IdNameCodeModel): Observable<IdNameCodeModel> {
    return of(new IdNameCodeModel()).pipe(
      tap((flightAllowed: IdNameCodeModel) => {
        this.flightsAllowed = Utilities.updateArray<IdNameCodeModel>(this.flightsAllowed, flightAllowed, {
          replace: true,
          predicate: t => t.id === flightAllowed.id,
        });
      })
    );
  }

  public getWhoCanLeaveAircraft(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((whoCanLeaveAircraft: SettingsTypeModel[]) => {
        this.whoCanLeaveAircraft = whoCanLeaveAircraft;
      })
    );
  }

  public upsertWhoCanLeaveAircraft(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((whoCanLeaveAircraft: SettingsTypeModel) => {
        this.whoCanLeaveAircraft = Utilities.updateArray<SettingsTypeModel>(
          this.whoCanLeaveAircraft,
          whoCanLeaveAircraft,
          {
            replace: true,
            predicate: t => t.id === whoCanLeaveAircraft.id,
          }
        );
      })
    );
  }

  public upsertVaccinationPrivilege(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((vaccinationPrivilege: SettingsTypeModel) => {
        this.vaccinationPrivileges = Utilities.updateArray<SettingsTypeModel>(
          this.vaccinationPrivileges,
          vaccinationPrivilege,
          {
            replace: true,
            predicate: t => t.id === vaccinationPrivilege.id,
          }
        );
      })
    );
  }

  public getVaccinationPrivileges(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((vaccinationPrivileges: SettingsTypeModel[]) => {
        this.vaccinationPrivileges = vaccinationPrivileges;
      })
    );
  }

  public getVaccineManufacturers(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((vaccineManufacturers: SettingsTypeModel[]) => {
        this.vaccineManufacturers = vaccineManufacturers;
      })
    );
  }

  public upsertVaccineManufacturer(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((vaccineManufacturer: SettingsTypeModel) => {
        this.vaccineManufacturers = Utilities.updateArray<SettingsTypeModel>(
          this.vaccineManufacturers,
          vaccineManufacturer,
          {
            replace: true,
            predicate: t => t.id === vaccineManufacturer.id,
          }
        );
      })
    );
  }

  public getOverflightLevels(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((overflightLevels: SettingsTypeModel[]) => {
        this.overflightLevels = overflightLevels;
      })
    );
  }

  public upsertOverflightLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((overflightLevel: SettingsTypeModel) => {
        this.overflightLevels = Utilities.updateArray<SettingsTypeModel>(this.overflightLevels, overflightLevel, {
          replace: true,
          predicate: t => t.id === overflightLevel.id,
        });
      })
    );
  }

  public getArrivalLevels(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((arrivalLevels: SettingsTypeModel[]) => {
        this.arrivalLevels = arrivalLevels;
      })
    );
  }

  public getPPETypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((ppeTypes: SettingsTypeModel[]) => {
        this.ppeTypes = ppeTypes;
      })
    );
  }

  public upsertPPEType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((ppeTypes: SettingsTypeModel) => {
        this.ppeTypes = Utilities.updateArray<SettingsTypeModel>(this.ppeTypes, ppeTypes, {
          replace: true,
          predicate: t => t.id === ppeTypes.id,
        });
      })
    );
  }

  public upsertArrivalLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((arrivalLevel: SettingsTypeModel) => {
        this.arrivalLevels = Utilities.updateArray<SettingsTypeModel>(this.arrivalLevels, arrivalLevel, {
          replace: true,
          predicate: t => t.id === arrivalLevel.id,
        });
      })
    );
  }

  public getScheduleDepartureLevels(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((arrivalLevels: SettingsTypeModel[]) => {
        this.arrivalLevels = arrivalLevels;
      })
    );
  }

  public upsertScheduleDepartureLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((scheduleDepartureLevel: SettingsTypeModel) => {
        this.scheduleDepartureLevels = Utilities.updateArray<SettingsTypeModel>(
          this.scheduleDepartureLevels,
          scheduleDepartureLevel,
          {
            replace: true,
            predicate: t => t.id === scheduleDepartureLevel.id,
          }
        );
      })
    );
  }

  public getBoardingTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((boardingTypes: SettingsTypeModel[]) => {
        this.boardingTypes = boardingTypes;
      })
    );
  }

  public upsertBoardingType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((boardingType: SettingsTypeModel) => {
        this.boardingTypes = Utilities.updateArray<SettingsTypeModel>(this.boardingTypes, boardingType, {
          replace: true,
          predicate: t => t.id === boardingType.id,
        });
      })
    );
  }

  public getStayLengthCategories(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((stayLengthCategories: SettingsTypeModel[]) => {
        this.stayLengthCategories = stayLengthCategories;
      })
    );
  }

  public upsertStayLengthCategory(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((stayLengthCategory: SettingsTypeModel) => {
        this.stayLengthCategories = Utilities.updateArray<SettingsTypeModel>(
          this.stayLengthCategories,
          stayLengthCategory,
          {
            replace: true,
            predicate: t => t.id === stayLengthCategory.id,
          }
        );
      })
    );
  }

  public getIdTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((idTypes: SettingsTypeModel[]) => {
        this.idTypes = idTypes;
      })
    );
  }

  public upsertIdType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((idType: SettingsTypeModel) => {
        this.idTypes = Utilities.updateArray<SettingsTypeModel>(this.idTypes, idType, {
          replace: true,
          predicate: t => t.id === idType.id,
        });
      })
    );
  }

  public getCurfewHourTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((curfewHourTypes: SettingsTypeModel[]) => {
        this.curfewHourTypes = curfewHourTypes;
      })
    );
  }

  public upsertCurfewHourType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((curfewHourType: SettingsTypeModel) => {
        this.curfewHourTypes = Utilities.updateArray<SettingsTypeModel>(this.curfewHourTypes, curfewHourType, {
          replace: true,
          predicate: t => t.id === curfewHourType.id,
        });
      })
    );
  }

  public getTraveledHistoryCategories(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((traveledHistoryCategories: SettingsTypeModel[]) => {
        this.traveledHistoryCategories = traveledHistoryCategories;
      })
    );
  }

  public upsertTravelHistoryCategory(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((travelHistoryCategory: SettingsTypeModel) => {
        this.traveledHistoryCategories = Utilities.updateArray<SettingsTypeModel>(
          this.traveledHistoryCategories,
          travelHistoryCategory,
          {
            replace: true,
            predicate: t => t.id === travelHistoryCategory.id,
          }
        );
      })
    );
  }

  public getTravellerTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel() ]).pipe(
      tap((travellerTypes: SettingsTypeModel[]) => {
        this.travellerTypes = travellerTypes;
      })
    );
  }

  public upsertTravellerType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((travellerType: SettingsTypeModel) => {
        this.travellerTypes = Utilities.updateArray<SettingsTypeModel>(this.travellerTypes, travellerType, {
          replace: true,
          predicate: t => t.id === travellerType.id,
        });
      })
    );
  }

  public getVaccinationStatus(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel() ]).pipe(
      tap((vaccinationStatus: SettingsTypeModel[]) => {
        this.vaccinationStatus = vaccinationStatus;
      })
    );
  }

  public upsertVaccinationStatus(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((vaccinationStatus: SettingsTypeModel) => {
        this.vaccinationStatus = Utilities.updateArray<SettingsTypeModel>(this.vaccinationStatus, vaccinationStatus, {
          replace: true,
          predicate: t => t.id === vaccinationStatus.id,
        });
      })
    );
  }

  public getTraveledHistorySubCategories(forceRefresh?: boolean): Observable<TraveledHistorySubCategoryModel[]> {
    return of([ new TraveledHistorySubCategoryModel() ]).pipe(
      tap((traveledHistorySubCategories: TraveledHistorySubCategoryModel[]) => {
        this.traveledHistorySubCategories = traveledHistorySubCategories;
      })
    );
  }

  public upsertTraveledHistorySubCategory(
    request: TraveledHistorySubCategoryModel
  ): Observable<TraveledHistorySubCategoryModel> {
    return of(new TraveledHistorySubCategoryModel()).pipe(
      tap((subCategory: TraveledHistorySubCategoryModel) => {
        this.traveledHistorySubCategories = Utilities.updateArray<TraveledHistorySubCategoryModel>(
          this.traveledHistorySubCategories,
          subCategory,
          {
            replace: true,
            predicate: t => t.id === subCategory.id,
          }
        );
      })
    );
  }

  public getUWAAllowableServices(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((uwaAllowableServices: SettingsTypeModel[]) => {
        this.uwaAllowableServices = uwaAllowableServices;
      })
    );
  }

  public upsertUWAAllowableService(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((uwaAllowableService: SettingsTypeModel) => {
        this.uwaAllowableServices = Utilities.updateArray<SettingsTypeModel>(
          this.uwaAllowableServices,
          uwaAllowableService,
          {
            replace: true,
            predicate: t => t.id === uwaAllowableService.id,
          }
        );
      })
    );
  }
}
