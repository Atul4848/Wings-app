import {
  SettingsBaseStore,
  baseApiPath,
  CAPPSTerritoryTypeModel,
  IAPICAPPSTerritoryType,
  HttpClient,
} from '@wings/shared';
import { apiUrls } from './API.url';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { observable } from 'mobx';
import { IAPINavblueCountryMapping, IAPISecurityThreatLevel } from '../Interfaces';
import { NavblueCountryMappingModel, SecurityThreatLevelModel } from '../Models';
import { Utilities, tapWithAction, SettingsTypeModel, IdNameCodeModel } from '@wings-shared/core';
import { Logger } from '@wings-shared/security';
import { AlertStore } from '@uvgo-shared/alert';

export class SettingsStore extends SettingsBaseStore {
  @observable public regionTypes: SettingsTypeModel[] = [];
  @observable public feeRequirement: SettingsTypeModel[] = [];
  @observable public stateTypes: SettingsTypeModel[] = [];
  @observable public territoryTypes: SettingsTypeModel[] = [];
  @observable public cappsTerritoryTypes: CAPPSTerritoryTypeModel[] = [];
  @observable public securityThreatLevels: SecurityThreatLevelModel[] = [];
  @observable public navBlueCountryMapping: NavblueCountryMappingModel[] = [];
  @observable public aipSourceTypes: SettingsTypeModel[] = [];
  @observable public documents: IdNameCodeModel[] = [];
  @observable public navigators: SettingsTypeModel[] = [];
  @observable public cabotageExemptionLevels: SettingsTypeModel[] = [];
  @observable public weaponInformation: SettingsTypeModel[] = [];
  @observable public item18Content: SettingsTypeModel[] = [];
  @observable public aircraftEquipment: SettingsTypeModel[] = [];
  @observable public apisRequirement: SettingsTypeModel[] = [];
  @observable public apisSubmission: SettingsTypeModel[] = [];
  @observable public disinsectionType: SettingsTypeModel[] = [];
  @observable public disinsectionChemical: SettingsTypeModel[] = [];
  @observable public declarationForCashCurrency: SettingsTypeModel[] = [];
  @observable public requirementType: SettingsTypeModel[] = [];
  @observable public flightOperationalCategories: SettingsTypeModel[] = [];
  @observable public expiration: SettingsTypeModel[] = [];
  @observable public faocApplicable: SettingsTypeModel[] = [];

  constructor() {
    super(baseApiPath.countries);
  }

  /* istanbul ignore next */
  public getRegionTypes(name?: string, forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = name && { FilterCollection: JSON.stringify([{ name }]) };
    return this.getResult(apiUrls.regionType, this.regionTypes, forceRefresh, SettingsTypeModel.deserializeList, {
      params,
    }).pipe(tapWithAction(regionTypes => (this.regionTypes = regionTypes)));
  }

  /* istanbul ignore next */
  public upsertRegionType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRegionType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.regionType, 'Region Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.regionTypes = Utilities.updateArray<SettingsTypeModel>(this.regionTypes, settingsType, {
          replace: !isAddRegionType,
          predicate: t => t.id === settingsType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getFeeRequirement(name?: string, forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = name && { FilterCollection: JSON.stringify([{ name }]) };
    return this.getResult(
      apiUrls.feeRequirement,
      this.feeRequirement,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      {
        params,
      }
    ).pipe(tapWithAction(feeRequirements => (this.feeRequirement = feeRequirements)));
  }

  /* istanbul ignore next */
  public upsertFeeRequirement(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddFeeRequirements: boolean = request.id === 0;
    return this.upsert(request, apiUrls.feeRequirement, 'Fee Requirement').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.feeRequirement = Utilities.updateArray<SettingsTypeModel>(this.feeRequirement, settingsType, {
          replace: !isAddFeeRequirements,
          predicate: t => t.id === settingsType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getStateTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.stateType, this.stateTypes, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(stateTypes => (this.stateTypes = stateTypes))
    );
  }

  /* istanbul ignore next */
  public upsertStateType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddStateType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.stateType, 'State Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.stateTypes = Utilities.updateArray<SettingsTypeModel>(this.stateTypes, settingsType, {
          replace: !isAddStateType,
          predicate: t => t.id === settingsType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getTerritoryTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.territoryType,
      this.territoryTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(territoryTypes => (this.territoryTypes = territoryTypes)));
  }

  /* istanbul ignore next */
  public upsertTerritoryType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.territoryType, 'Territory Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.territoryTypes = Utilities.updateArray<SettingsTypeModel>(this.territoryTypes, settingsType, {
          replace: !isNewRequest,
          predicate: t => t.id === settingsType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getCAPPSTerritoryType(forceRefresh?: boolean): Observable<CAPPSTerritoryTypeModel[]> {
    return this.getResult<CAPPSTerritoryTypeModel, IAPICAPPSTerritoryType>(
      apiUrls.cappsTerritoryType,
      this.cappsTerritoryTypes,
      forceRefresh,
      CAPPSTerritoryTypeModel.deserializeList
    ).pipe(tapWithAction(cappsTerritoryTypes => (this.cappsTerritoryTypes = cappsTerritoryTypes)));
  }

  /* istanbul ignore next */
  public upsertCAPPSTerritoryType(request: CAPPSTerritoryTypeModel): Observable<CAPPSTerritoryTypeModel> {
    const isAddCAPPSTerritoryType: boolean = request.id === 0;
    return this.upsert<IAPICAPPSTerritoryType>(request, apiUrls.cappsTerritoryType, 'CAPPS Territory Type').pipe(
      map((response: IAPICAPPSTerritoryType) => CAPPSTerritoryTypeModel.deserialize(response)),
      tapWithAction((cappsTerritoryType: CAPPSTerritoryTypeModel) => {
        this.cappsTerritoryTypes = Utilities.updateArray<CAPPSTerritoryTypeModel>(
          this.cappsTerritoryTypes,
          cappsTerritoryType,
          {
            replace: !isAddCAPPSTerritoryType,
            predicate: t => t.id === cappsTerritoryType.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getSecurityThreatLevels(forceRefresh?: boolean): Observable<SecurityThreatLevelModel[]> {
    return this.getResult<SecurityThreatLevelModel, IAPISecurityThreatLevel>(
      apiUrls.securityThreatLevel,
      this.securityThreatLevels,
      forceRefresh,
      SecurityThreatLevelModel.deserializeList
    ).pipe(tapWithAction(cappsTerritoryTypes => (this.securityThreatLevels = cappsTerritoryTypes)));
  }

  /* istanbul ignore next */
  public upsertSecurityThreatLevel(request: SecurityThreatLevelModel): Observable<SecurityThreatLevelModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert<IAPISecurityThreatLevel>(request, apiUrls.securityThreatLevel, 'Security Threat Level').pipe(
      map((response: IAPISecurityThreatLevel) => SecurityThreatLevelModel.deserialize(response)),
      tapWithAction((securityThreatLevel: SecurityThreatLevelModel) => {
        this.securityThreatLevels = Utilities.updateArray<SecurityThreatLevelModel>(
          this.securityThreatLevels,
          securityThreatLevel,
          {
            replace: !isNewRequest,
            predicate: t => t.id === securityThreatLevel.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getAIPSourceTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.aipSourceType,
      this.aipSourceTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(aipSourceType => (this.aipSourceTypes = aipSourceType)));
  }

  /* istanbul ignore next */
  public upsertAIPSourceTypes(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddSourceType: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.aipSourceType, 'AIP Source Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.aipSourceTypes = Utilities.updateArray<SettingsTypeModel>(this.aipSourceTypes, settingsType, {
          replace: !isAddSourceType,
          predicate: t => t.id === settingsType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getDocuments(forceRefresh?: boolean): Observable<IdNameCodeModel[]> {
    return this.getResult(apiUrls.documents, this.documents, forceRefresh as boolean, IdNameCodeModel.deserializeList, {
      baseUrl: baseApiPath.permits,
    }).pipe(tapWithAction(documents => (this.documents = documents)));
  }

  /* istanbul ignore next */
  public getNavigators(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.navigator, this.navigators, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(navigators => (this.navigators = navigators))
    );
  }

  /* istanbul ignore next */
  public upsertNavigators(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewNavigator: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.navigator, 'Navigators').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.navigators = Utilities.updateArray<SettingsTypeModel>(this.navigators, settingsType, {
          replace: !isNewNavigator,
          predicate: t => t.id === settingsType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getCabotageExemptionLevels(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.cabotageExemptionLevel,
      this.cabotageExemptionLevels,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(cabotageExemptionLevels => (this.cabotageExemptionLevels = cabotageExemptionLevels)));
  }

  /* istanbul ignore next */
  public upsertCabotageExemptionLevels(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddNewLevel: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.cabotageExemptionLevel, 'Cabotage Exemption Level').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.cabotageExemptionLevels = Utilities.updateArray<SettingsTypeModel>(
          this.cabotageExemptionLevels,
          settingsType,
          {
            replace: !isAddNewLevel,
            predicate: t => t.id === settingsType.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getWeaponInformation(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.weaponInformation,
      this.weaponInformation,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(weaponInformation => (this.weaponInformation = weaponInformation)));
  }

  /* istanbul ignore next */
  public upsertWeaponInformation(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddNewLevel: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.weaponInformation, 'Weapon Information').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.weaponInformation = Utilities.updateArray<SettingsTypeModel>(this.weaponInformation, settingsType, {
          replace: !isAddNewLevel,
          predicate: t => t.id === settingsType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getItem18Content(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.item18Content,
      this.item18Content,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(item18Content => (this.item18Content = item18Content)));
  }

  /* istanbul ignore next */
  public upsertItem18Content(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddNewLevel: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.item18Content, 'Item 18 Content').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.item18Content = Utilities.updateArray<SettingsTypeModel>(this.item18Content, settingsType, {
          replace: !isAddNewLevel,
          predicate: t => t.id === settingsType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getAircraftEquipment(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.aircraftEquipment,
      this.aircraftEquipment,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(aircraftEquipment => (this.aircraftEquipment = aircraftEquipment)));
  }

  /* istanbul ignore next */
  public upsertAircraftEquipment(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddNewLevel: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.aircraftEquipment, 'Aircraft Equipment').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.aircraftEquipment = Utilities.updateArray<SettingsTypeModel>(this.aircraftEquipment, settingsType, {
          replace: !isAddNewLevel,
          predicate: t => t.id === settingsType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getAPISRequirement(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.apisRequirement,
      this.apisRequirement,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(apisRequirement => (this.apisRequirement = apisRequirement)));
  }

  /* istanbul ignore next */
  public upsertAPISRequirement(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddNewLevel: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.apisRequirement, 'APIS Requirement').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.apisRequirement = Utilities.updateArray<SettingsTypeModel>(this.apisRequirement, settingsType, {
          replace: !isAddNewLevel,
          predicate: t => t.id === settingsType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getAPISSubmission(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.apisSubmission,
      this.apisSubmission,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(apisSubmission => (this.apisSubmission = apisSubmission)));
  }

  /* istanbul ignore next */
  public upsertAPISSubmission(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddNewLevel: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.apisSubmission, 'APIS Submission').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.apisSubmission = Utilities.updateArray<SettingsTypeModel>(this.apisSubmission, settingsType, {
          replace: !isAddNewLevel,
          predicate: t => t.id === settingsType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getDisinsectionType(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.disinsectionType,
      this.disinsectionType,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(disinsectionType => (this.disinsectionType = disinsectionType)));
  }

  /* istanbul ignore next */
  public upsertDisinsectionType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddNewLevel: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.disinsectionType, 'Disinsection Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.disinsectionType = Utilities.updateArray<SettingsTypeModel>(this.disinsectionType, settingsType, {
          replace: !isAddNewLevel,
          predicate: t => t.id === settingsType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getDisinsectionChemical(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.disinsectionChemical,
      this.disinsectionChemical,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(disinsectionChemical => (this.disinsectionChemical = disinsectionChemical)));
  }

  /* istanbul ignore next */
  public upsertDisinsectionChemical(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddNewLevel: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.disinsectionChemical, 'Disinsection Chemical').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.disinsectionChemical = Utilities.updateArray<SettingsTypeModel>(this.disinsectionChemical, settingsType, {
          replace: !isAddNewLevel,
          predicate: t => t.id === settingsType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getDeclarationForCashCurrency(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.declarationForCashCurrency,
      this.declarationForCashCurrency,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(declarationForCashCurrency => (this.declarationForCashCurrency = declarationForCashCurrency)));
  }

  /* istanbul ignore next */
  public upsertDeclarationForCashCurrency(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddNewLevel: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.declarationForCashCurrency, 'Declaration for Cash Currency').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.declarationForCashCurrency = Utilities.updateArray<SettingsTypeModel>(
          this.declarationForCashCurrency,
          settingsType,
          {
            replace: !isAddNewLevel,
            predicate: t => t.id === settingsType.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getRequirementType(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.requirementType,
      this.requirementType,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(requirementType => (this.requirementType = requirementType)));
  }

  /* istanbul ignore next */
  public upsertRequirementType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddNewLevel: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.requirementType, 'Requirement Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.requirementType = Utilities.updateArray<SettingsTypeModel>(this.requirementType, settingsType, {
          replace: !isAddNewLevel,
          predicate: t => t.id === settingsType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getFlightOperationalCategories(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.flightOperationalCategory,
      this.flightOperationalCategories,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { sortKey: 'name', baseUrl: baseApiPath.permits }
    ).pipe(
      tapWithAction(
        (flightOperationalCategories: SettingsTypeModel[]) =>
          (this.flightOperationalCategories = flightOperationalCategories)
      )
    );
  }

  /* istanbul ignore next */
  public getNavBlueCountryMapping(forceRefresh?: boolean): Observable<NavblueCountryMappingModel[]> {
    return this.getResult<NavblueCountryMappingModel, IAPINavblueCountryMapping>(
      apiUrls.navblueCountryMapping,
      this.navBlueCountryMapping,
      forceRefresh,
      NavblueCountryMappingModel.deserializeList
    ).pipe(tapWithAction(navBlueCountryMapping => (this.navBlueCountryMapping = navBlueCountryMapping)));
  }

  /* istanbul ignore next */
  public upsertNavBlueCountryMapping(navBlueCode: IAPINavblueCountryMapping): Observable<NavblueCountryMappingModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    return http
      .put<IAPINavblueCountryMapping>(`${apiUrls.navblueCountryMapping}/${navBlueCode.countryId}`, navBlueCode)
      .pipe(
        Logger.observableCatchError,
        map((response: IAPINavblueCountryMapping) => NavblueCountryMappingModel.deserialize(response)),
        tap(() => AlertStore.info('NavBlue Country Mapping updated successfully!'))
      );
  }

  /* istanbul ignore next */
  public getExpiration(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.expirationType,
      this.expiration,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(expiration => (this.expiration = expiration)));
  }

  /* istanbul ignore next */
  public upsertExpiration(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddExpiration: boolean = request.id === 0;
    return this.upsert(request, apiUrls.expirationType, 'Expiration Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((expiration: SettingsTypeModel) => {
        this.expiration = Utilities.updateArray<SettingsTypeModel>(this.expiration, expiration, {
          replace: !isAddExpiration,
          predicate: t => t.id === expiration.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getFAOCApplicable(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.faocApplicable,
      this.faocApplicable,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(faocApplicable => (this.faocApplicable = faocApplicable)));
  }

  /* istanbul ignore next */
  public upsertFAOCApplicable(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddFAOCApplicable: boolean = request.id === 0;
    return this.upsert(request, apiUrls.faocApplicable, 'FAOC Applicable').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((faocApplicable: SettingsTypeModel) => {
        this.faocApplicable = Utilities.updateArray<SettingsTypeModel>(this.faocApplicable, faocApplicable, {
          replace: !isAddFAOCApplicable,
          predicate: t => t.id === faocApplicable.id,
        });
      })
    );
  }
}
