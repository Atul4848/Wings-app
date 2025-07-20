import { SettingsBaseStore, baseApiPath, ModelStatusOptions } from '@wings/shared';
import { apiUrls } from './API.url';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { observable } from 'mobx';
import { TraveledHistorySubCategoryModel, RestrictionSourceModel, UWAAllowableActionModel } from '../Models';
import { IAPITraveledHistorySubCategory } from '..';
import { Utilities, tapWithAction, IdNameCodeModel, SettingsTypeModel } from '@wings-shared/core';

export class SettingsStore extends SettingsBaseStore {
  @observable public uwaAllowableActions: UWAAllowableActionModel[] = [];
  @observable public uwaAllowableServices: SettingsTypeModel[] = [];
  @observable public restrictionTypes: SettingsTypeModel[] = [];
  @observable public landingOrOverflights: SettingsTypeModel[] = [];
  @observable public approvalTypes: SettingsTypeModel[] = [];
  @observable public restrictionApplies: SettingsTypeModel[] = [];
  @observable public restrictionSources: RestrictionSourceModel[] = [];
  @observable public restrictionLevels: SettingsTypeModel[] = [];
  @observable public testTypes: SettingsTypeModel[] = [];
  @observable public healthForms: SettingsTypeModel[] = [];
  @observable public status: SettingsTypeModel[] = [];
  @observable public leadTimeIndicators: IdNameCodeModel[] = [];
  @observable public flightsAllowed: IdNameCodeModel[] = [];
  @observable public whoCanLeaveAircraft: SettingsTypeModel[] = [];
  @observable public vaccinationPrivileges: SettingsTypeModel[] = [];
  @observable public overflightLevels: SettingsTypeModel[] = [];
  @observable public vaccineManufacturers: SettingsTypeModel[] = [];
  @observable public arrivalLevels: SettingsTypeModel[] = [];
  @observable public scheduleDepartureLevels: SettingsTypeModel[] = [];
  @observable public stayLengthCategories: SettingsTypeModel[] = [];
  @observable public boardingTypes: SettingsTypeModel[] = [];
  @observable public ppeTypes: SettingsTypeModel[] = [];
  @observable public curfewHourTypes: SettingsTypeModel[] = [];
  @observable public idTypes: SettingsTypeModel[] = [];
  @observable public traveledHistoryCategories: SettingsTypeModel[] = [];
  @observable public traveledHistorySubCategories: TraveledHistorySubCategoryModel[] = [];
  @observable public travellerTypes: SettingsTypeModel[] = [];
  @observable public vaccinationStatus: SettingsTypeModel[] = [];

  constructor() {
    super(baseApiPath.restrictions);
  }

  /* istanbul ignore next */
  public getUWAAllowableActions(forceRefresh: boolean = false): Observable<UWAAllowableActionModel[]> {
    return this.getResult(
      apiUrls.uwaAllowableAction,
      this.uwaAllowableActions,
      forceRefresh,
      UWAAllowableActionModel.deserializeList
    ).pipe(tapWithAction(uwaAllowableActions => (this.uwaAllowableActions = uwaAllowableActions)));
  }

  /* istanbul ignore next */
  public upsertUWAAllowableAction(request: UWAAllowableActionModel): Observable<UWAAllowableActionModel> {
    const isAddUWAAllowableAction: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.uwaAllowableAction, 'UWA Allowable Action').pipe(
      map(response => UWAAllowableActionModel.deserialize(response)),
      tapWithAction((uwaAllowableAction: UWAAllowableActionModel) => {
        this.uwaAllowableActions = Utilities.updateArray<UWAAllowableActionModel>(
          this.uwaAllowableActions,
          uwaAllowableAction,
          {
            replace: !isAddUWAAllowableAction,
            predicate: t => t.id === uwaAllowableAction.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getUWAAllowableServices(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.uwaAllowableService,
      this.uwaAllowableServices,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(uwaAllowableServices => (this.uwaAllowableServices = uwaAllowableServices)));
  }

  /* istanbul ignore next */
  public upsertUWAAllowableService(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddUWAAllowableService: boolean = request.id === 0;
    return this.upsert(request, apiUrls.uwaAllowableService, 'UWA Allowable Service').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((uwaAllowableService: SettingsTypeModel) => {
        this.uwaAllowableServices = Utilities.updateArray<SettingsTypeModel>(
          this.uwaAllowableServices,
          uwaAllowableService,
          {
            replace: !isAddUWAAllowableService,
            predicate: t => t.id === uwaAllowableService.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getRestrictionTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.restrictionType,
      this.restrictionTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(restrictionTypes => (this.restrictionTypes = restrictionTypes)));
  }

  /* istanbul ignore next */
  public upsertRestrictionType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRestrictionType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.restrictionType, 'Restriction Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((restrictionType: SettingsTypeModel) => {
        this.restrictionTypes = Utilities.updateArray<SettingsTypeModel>(this.restrictionTypes, restrictionType, {
          replace: !isAddRestrictionType,
          predicate: t => t.id === restrictionType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getLandingOrOverflights(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.landingOrOverFlight,
      this.landingOrOverflights,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(landingOrOverflights => (this.landingOrOverflights = landingOrOverflights)));
  }

  /* istanbul ignore next */
  public upsertLandingOrOverflight(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddLandingOrOverflight: boolean = request.id === 0;
    return this.upsert(request, apiUrls.landingOrOverFlight, 'Landing Or Overflight').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((landingOrOverflight: SettingsTypeModel) => {
        this.landingOrOverflights = Utilities.updateArray<SettingsTypeModel>(
          this.landingOrOverflights,
          landingOrOverflight,
          {
            replace: !isAddLandingOrOverflight,
            predicate: t => t.id === landingOrOverflight.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getApprovalTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.approvalType,
      this.approvalTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(approvalTypes => (this.approvalTypes = approvalTypes)));
  }

  /* istanbul ignore next */
  public upsertApprovalType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddApprovalType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.approvalType, 'Approval Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((approvalType: SettingsTypeModel) => {
        this.approvalTypes = Utilities.updateArray<SettingsTypeModel>(this.approvalTypes, approvalType, {
          replace: !isAddApprovalType,
          predicate: t => t.id === approvalType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getRestrictionApplies(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.restrictionApplied,
      this.restrictionApplies,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(restrictionApplies => (this.restrictionApplies = restrictionApplies)));
  }

  /* istanbul ignore next */
  public upsertRestrictionApply(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRestrictionApply: boolean = request.id === 0;
    return this.upsert(request, apiUrls.restrictionApplied, 'Restriction Apply').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((restrictionApplied: SettingsTypeModel) => {
        this.restrictionApplies = Utilities.updateArray<SettingsTypeModel>(
          this.restrictionApplies,
          restrictionApplied,
          {
            replace: !isAddRestrictionApply,
            predicate: t => t.id === restrictionApplied.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getRestrictionSources(forceRefresh: boolean = false): Observable<RestrictionSourceModel[]> {
    return this.getResult(
      apiUrls.restrictionSource,
      this.restrictionSources,
      forceRefresh,
      RestrictionSourceModel.deserializeList
    ).pipe(tapWithAction(restrictionSources => (this.restrictionSources = restrictionSources)));
  }

  /* istanbul ignore next */
  public upsertRestrictionSource(request: RestrictionSourceModel): Observable<RestrictionSourceModel> {
    const isAddRestrictionSource: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.restrictionSource, 'Restriction Source').pipe(
      map(response => RestrictionSourceModel.deserialize(response)),
      tapWithAction((restrictionSource: RestrictionSourceModel) => {
        this.restrictionSources = Utilities.updateArray<RestrictionSourceModel>(
          this.restrictionSources,
          restrictionSource,
          {
            replace: !isAddRestrictionSource,
            predicate: t => t.id === restrictionSource.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getRestrictionLevels(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.restrictionLevel,
      this.restrictionLevels,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(restrictionLevels => (this.restrictionLevels = restrictionLevels)));
  }

  /* istanbul ignore next */
  public upsertRestrictionLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRestrictionLevel: boolean = request.id === 0;
    return this.upsert(request, apiUrls.restrictionLevel, 'Restriction Level').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((restrictionLevel: SettingsTypeModel) => {
        this.restrictionLevels = Utilities.updateArray<SettingsTypeModel>(this.restrictionLevels, restrictionLevel, {
          replace: !isAddRestrictionLevel,
          predicate: t => t.id === restrictionLevel.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getHealthForms(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.healthForm, this.healthForms, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(healthForms => (this.healthForms = healthForms))
    );
  }

  /* istanbul ignore next */
  public upsertHealthForm(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.healthForm, 'Health form').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((healthForm: SettingsTypeModel) => {
        this.healthForms = Utilities.updateArray<SettingsTypeModel>(this.healthForms, healthForm, {
          replace: !isAddRequest,
          predicate: t => t.id === healthForm.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getTestTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.testType, this.testTypes, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(testTypes => (this.testTypes = testTypes))
    );
  }

  /* istanbul ignore next */
  public upsertTestType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.testType, 'Test Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((testType: SettingsTypeModel) => {
        this.testTypes = Utilities.updateArray<SettingsTypeModel>(this.testTypes, testType, {
          replace: !isAddRequest,
          predicate: t => t.id === testType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getLeadTimeIndicators(forceRefresh: boolean = false): Observable<IdNameCodeModel[]> {
    return this.getResult(
      apiUrls.leadTimeIndicator,
      this.leadTimeIndicators,
      forceRefresh,
      IdNameCodeModel.deserializeList
    ).pipe(tapWithAction(leadTimeIndicators => (this.leadTimeIndicators = leadTimeIndicators)));
  }

  /* istanbul ignore next */
  public upsertLeadTimeIndicator(request: IdNameCodeModel): Observable<IdNameCodeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.leadTimeIndicator, 'Lead Time Indicator').pipe(
      map(response => IdNameCodeModel.deserialize(response)),
      tapWithAction((leadTimeIndicator: IdNameCodeModel) => {
        this.leadTimeIndicators = Utilities.updateArray<IdNameCodeModel>(this.leadTimeIndicators, leadTimeIndicator, {
          replace: !isAddRequest,
          predicate: t => t.id === leadTimeIndicator.id,
        });
      })
    );
  }
  /* istanbul ignore next */
  public getStatus(): Observable<SettingsTypeModel[]> {
    return of(ModelStatusOptions).pipe(
      map(response => response.map(m => SettingsTypeModel.deserialize({ id: Number(m.value), name: m.label }))),
      tapWithAction(status => (this.status = status))
    );
  }

  /* istanbul ignore next */
  public getFlightsAllowed(forceRefresh: boolean = false): Observable<IdNameCodeModel[]> {
    return this.getResult(
      apiUrls.flightsAllowed,
      this.flightsAllowed,
      forceRefresh,
      IdNameCodeModel.deserializeList
    ).pipe(tapWithAction((flightsAllowed: IdNameCodeModel[]) => (this.flightsAllowed = flightsAllowed)));
  }

  /* istanbul ignore next */
  public upsertFlightAllowed(request: IdNameCodeModel): Observable<IdNameCodeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.flightsAllowed, 'Flight Allowed').pipe(
      map(response => IdNameCodeModel.deserialize(response)),
      tapWithAction((flightAllowed: IdNameCodeModel) => {
        this.flightsAllowed = Utilities.updateArray<IdNameCodeModel>(this.flightsAllowed, flightAllowed, {
          replace: !isAddRequest,
          predicate: t => t.id === flightAllowed.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getWhoCanLeaveAircraft(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.whoCanLeaveAircraft,
      this.whoCanLeaveAircraft,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(
      tapWithAction((whoCanLeaveAircraft: SettingsTypeModel[]) => (this.whoCanLeaveAircraft = whoCanLeaveAircraft))
    );
  }

  /* istanbul ignore next */
  public upsertWhoCanLeaveAircraft(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.whoCanLeaveAircraft, 'Who Can Leave Aircraft Record').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((whoCanLeaveAircraft: SettingsTypeModel) => {
        this.whoCanLeaveAircraft = Utilities.updateArray<SettingsTypeModel>(
          this.whoCanLeaveAircraft,
          whoCanLeaveAircraft,
          {
            replace: !isAddRequest,
            predicate: t => t.id === whoCanLeaveAircraft.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getVaccinationPrivileges(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.vaccinationPrivilege,
      this.vaccinationPrivileges,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(
      tapWithAction(
        (vaccinationPrivileges: SettingsTypeModel[]) => (this.vaccinationPrivileges = vaccinationPrivileges)
      )
    );
  }

  /* istanbul ignore next */
  public upsertVaccinationPrivilege(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.vaccinationPrivilege, 'Vaccination Privilege').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((VaccinationPrivilege: SettingsTypeModel) => {
        this.vaccinationPrivileges = Utilities.updateArray<SettingsTypeModel>(
          this.vaccinationPrivileges,
          VaccinationPrivilege,
          {
            replace: !isAddRequest,
            predicate: t => t.id === VaccinationPrivilege.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getOverflightLevels(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.overFlightLevel,
      this.overflightLevels,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction((overflightLevels: SettingsTypeModel[]) => (this.overflightLevels = overflightLevels)));
  }

  /* istanbul ignore next */
  public upsertOverflightLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddOverflightLevel: boolean = request.id === 0;
    return this.upsert(request, apiUrls.overFlightLevel, 'Overflight Level').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((overflightLevel: SettingsTypeModel) => {
        this.overflightLevels = Utilities.updateArray<SettingsTypeModel>(this.overflightLevels, overflightLevel, {
          replace: !isAddOverflightLevel,
          predicate: t => t.id === overflightLevel.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getVaccineManufacturers(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.vaccineManufacturers,
      this.vaccineManufacturers,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(
      tapWithAction((vaccineManufacturers: SettingsTypeModel[]) => (this.vaccineManufacturers = vaccineManufacturers))
    );
  }

  /* istanbul ignore next */
  public upsertVaccineManufacturer(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.vaccineManufacturers, 'Vaccination Manufacturer').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((vaccineManufacturer: SettingsTypeModel) => {
        this.vaccineManufacturers = Utilities.updateArray<SettingsTypeModel>(
          this.vaccineManufacturers,
          vaccineManufacturer,
          {
            replace: !isAddRequest,
            predicate: t => t.id === vaccineManufacturer.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getArrivalLevels(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.arrivalLevel,
      this.arrivalLevels,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction((arrivalLevels: SettingsTypeModel[]) => (this.arrivalLevels = arrivalLevels)));
  }

  /* istanbul ignore next */
  public upsertArrivalLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddArrivalLevel: boolean = request.id === 0;
    return this.upsert(request, apiUrls.arrivalLevel, 'Arrival Level').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((arrivalLevel: SettingsTypeModel) => {
        this.arrivalLevels = Utilities.updateArray<SettingsTypeModel>(this.arrivalLevels, arrivalLevel, {
          replace: !isAddArrivalLevel,
          predicate: t => t.id === arrivalLevel.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getBoardingTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.boardingType,
      this.boardingTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction((boardingTypes: SettingsTypeModel[]) => (this.boardingTypes = boardingTypes)));
  }

  /* istanbul ignore next */
  public upsertBoardingType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.boardingType, 'Boarding Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((boardingType: SettingsTypeModel) => {
        this.boardingTypes = Utilities.updateArray<SettingsTypeModel>(this.boardingTypes, boardingType, {
          replace: !isAddRequest,
          predicate: t => t.id === boardingType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getScheduleDepartureLevels(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.scheduleDepartureLevel,
      this.scheduleDepartureLevels,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(
      tapWithAction((scheduleDepartureLevels: SettingsTypeModel[]) => {
        this.scheduleDepartureLevels = scheduleDepartureLevels;
      })
    );
  }

  /* istanbul ignore next */
  public upsertScheduleDepartureLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddScheduleDepartureLevel: boolean = request.id === 0;
    return this.upsert(request, apiUrls.scheduleDepartureLevel, 'Departure Level').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((scheduleDepartureLevel: SettingsTypeModel) => {
        this.scheduleDepartureLevels = Utilities.updateArray<SettingsTypeModel>(
          this.scheduleDepartureLevels,
          scheduleDepartureLevel,
          {
            replace: !isAddScheduleDepartureLevel,
            predicate: t => t.id === scheduleDepartureLevel.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getPPETypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.ppeType, this.ppeTypes, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction((ppeTypes: SettingsTypeModel[]) => (this.ppeTypes = ppeTypes))
    );
  }

  /* istanbul ignore next */
  public getStayLengthCategories(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.stayLengthCategory,
      this.stayLengthCategories,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(
      tapWithAction((stayLengthCategories: SettingsTypeModel[]) => (this.stayLengthCategories = stayLengthCategories))
    );
  }

  /* istanbul ignore next */
  public upsertStayLengthCategory(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRecord: boolean = request.id === 0;
    return this.upsert(request, apiUrls.stayLengthCategory, 'Stay Length Category').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((stayLengthCategory: SettingsTypeModel) => {
        this.stayLengthCategories = Utilities.updateArray<SettingsTypeModel>(
          this.stayLengthCategories,
          stayLengthCategory,
          {
            replace: !isNewRecord,
            predicate: t => t.id === stayLengthCategory.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getCurfewHourTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.curfewHourType,
      this.curfewHourTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction((curfewHoursTypes: SettingsTypeModel[]) => (this.curfewHourTypes = curfewHoursTypes)));
  }

  /* istanbul ignore next */
  public upsertCurfewHourType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.curfewHourType, 'Curfew Hour Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((curfewHourType: SettingsTypeModel) => {
        this.curfewHourTypes = Utilities.updateArray<SettingsTypeModel>(this.curfewHourTypes, curfewHourType, {
          replace: !isAddRequest,
          predicate: t => t.id === curfewHourType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public upsertPPEType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRecord: boolean = request.id === 0;
    return this.upsert(request, apiUrls.ppeType, 'PPE Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((ppeType: SettingsTypeModel) => {
        this.ppeTypes = Utilities.updateArray<SettingsTypeModel>(this.ppeTypes, ppeType, {
          replace: !isNewRecord,
          predicate: t => t.id === ppeType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getIdTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.idType, this.idTypes, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction((idTypes: SettingsTypeModel[]) => (this.idTypes = idTypes))
    );
  }

  /* istanbul ignore next */
  public upsertIdType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.idType, 'Id Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((idType: SettingsTypeModel) => {
        this.idTypes = Utilities.updateArray<SettingsTypeModel>(this.idTypes, idType, {
          replace: !isAddRequest,
          predicate: t => t.id === idType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getTravellerTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.travellerType,
      this.travellerTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction((travellerTypes: SettingsTypeModel[]) => (this.travellerTypes = travellerTypes)));
  }

  /* istanbul ignore next */
  public upsertTravellerType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.travellerType, 'Traveller Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((travellerType: SettingsTypeModel) => {
        this.travellerTypes = Utilities.updateArray<SettingsTypeModel>(this.travellerTypes, travellerType, {
          replace: !isAddRequest,
          predicate: t => t.id === travellerType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getTraveledHistoryCategories(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.traveledHistoryCategory,
      this.traveledHistoryCategories,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(traveledHistoryCategories => (this.traveledHistoryCategories = traveledHistoryCategories)));
  }

  /* istanbul ignore next */
  public upsertTravelHistoryCategory(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddUWAAllowableAction: boolean = request.id === 0;
    return this.upsert(request, apiUrls.traveledHistoryCategory, 'Travel History Category').pipe(
      map((response: SettingsTypeModel) => SettingsTypeModel.deserialize(response)),
      tapWithAction((traveledHistoryCategory: SettingsTypeModel) => {
        this.traveledHistoryCategories = Utilities.updateArray<SettingsTypeModel>(
          this.traveledHistoryCategories,
          traveledHistoryCategory,
          {
            replace: !isAddUWAAllowableAction,
            predicate: t => t.id === traveledHistoryCategory.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getVaccinationStatus(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.vaccinationStatus,
      this.vaccinationStatus,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction((vaccinationStatus: SettingsTypeModel[]) => (this.vaccinationStatus = vaccinationStatus)));
  }

  /* istanbul ignore next */
  public upsertVaccinationStatus(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.vaccinationStatus, 'Vaccination Status').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((vaccinationStatus: SettingsTypeModel) => {
        this.vaccinationStatus = Utilities.updateArray<SettingsTypeModel>(this.vaccinationStatus, vaccinationStatus, {
          replace: !isAddRequest,
          predicate: t => t.id === vaccinationStatus.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getTraveledHistorySubCategories(forceRefresh: boolean = false): Observable<TraveledHistorySubCategoryModel[]> {
    return this.getResult(
      apiUrls.traveledHistorySubCategory,
      this.traveledHistorySubCategories,
      forceRefresh,
      TraveledHistorySubCategoryModel.deserializeList
    ).pipe(
      tapWithAction(traveledHistorySubCategories => (this.traveledHistorySubCategories = traveledHistorySubCategories))
    );
  }

  /* istanbul ignore next */
  public upsertTraveledHistorySubCategory(
    request: TraveledHistorySubCategoryModel
  ): Observable<TraveledHistorySubCategoryModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert<IAPITraveledHistorySubCategory>(
      request.serialize(),
      apiUrls.traveledHistorySubCategory,
      'Traveled History Sub Category'
    ).pipe(
      map((response: IAPITraveledHistorySubCategory) => TraveledHistorySubCategoryModel.deserialize(response)),
      tapWithAction((traveledHistorySubCategory: TraveledHistorySubCategoryModel) => {
        this.traveledHistorySubCategories = Utilities.updateArray<TraveledHistorySubCategoryModel>(
          this.traveledHistorySubCategories,
          traveledHistorySubCategory,
          {
            replace: !isNewRequest,
            predicate: t => t.id === traveledHistorySubCategory.id,
          }
        );
      })
    );
  }
}
