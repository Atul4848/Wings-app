import { baseApiPath, SettingsBaseStore } from '@wings/shared';
import { observable } from 'mobx';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiUrls } from './API.url';
import { tapWithAction, Utilities, SettingsTypeModel } from '@wings-shared/core';

export class EtpSettingsStore extends SettingsBaseStore {
  @observable public etpScenarioTypes: SettingsTypeModel[] = [];
  @observable public etpTimeLimitTypes: SettingsTypeModel[] = [];
  @observable public etpAltDescentProfiles: SettingsTypeModel[] = [];
  @observable public ETPScenarioEngines: SettingsTypeModel[] = [];
  @observable public ETPLevels: SettingsTypeModel[] = [];
  @observable public ETPMainDescents: SettingsTypeModel[] = [];
  @observable public ETPFinalDescents: SettingsTypeModel[] = [];
  @observable public ETPCruiseProfiles: SettingsTypeModel[] = [];
  @observable public ETPHoldMethods: SettingsTypeModel[] = [];
  @observable public ETPPenaltyBias: SettingsTypeModel[] = [];
  @observable public ETPPenaltyApply: SettingsTypeModel[] = [];
  @observable public ETPAPUBurnMethods: SettingsTypeModel[] = [];
  @observable public ETPPenaltyCategories: SettingsTypeModel[] = [];
  @observable public etpPenaltyTypeFields: SettingsTypeModel[] = [];

  constructor() {
    super(baseApiPath.aircraft);
  }

  /* istanbul ignore next */
  public getETPScenarioTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.etpScenarioType,
      this.etpScenarioTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(etpScenarioTypes => (this.etpScenarioTypes = etpScenarioTypes)));
  }

  /* istanbul ignore next */
  public upsertETPScenarioType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddSourceType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.etpScenarioType, 'ETP Scenario Types').pipe(
      tapWithAction((etpScenarioTypes: SettingsTypeModel) => {
        this.etpScenarioTypes = Utilities.updateArray<SettingsTypeModel>(this.etpScenarioTypes, etpScenarioTypes, {
          replace: !isAddSourceType,
          predicate: t => t.id === etpScenarioTypes.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getETPScenarioEngines(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.ETPScenarioEngine,
      this.ETPScenarioEngines,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(ETPScenarioEngines => (this.ETPScenarioEngines = ETPScenarioEngines)));
  }

  /* istanbul ignore next */
  public upsertETPScenarioEngine(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.ETPScenarioEngine, 'ETP Scenario Engine').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((ETPScenarioEngine: SettingsTypeModel) => {
        this.ETPScenarioEngines = Utilities.updateArray<SettingsTypeModel>(this.ETPScenarioEngines, ETPScenarioEngine, {
          replace: !isAddRequest,
          predicate: t => t.id === ETPScenarioEngine.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getETPTimeLimitTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.etpTimeLimitType,
      this.etpTimeLimitTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(etpTimeLimitTypes => (this.etpTimeLimitTypes = etpTimeLimitTypes)));
  }

  /* istanbul ignore next */
  public upsertETPTimeLimitType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.etpTimeLimitType, 'ETP Time Limit Type').pipe(
      tapWithAction((etpTimeLimitTypes: SettingsTypeModel) => {
        this.etpTimeLimitTypes = Utilities.updateArray<SettingsTypeModel>(this.etpTimeLimitTypes, etpTimeLimitTypes, {
          replace: !isAddRequest,
          predicate: t => t.id === etpTimeLimitTypes.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getETPLevels(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.ETPLevel, this.ETPLevels, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(ETPLevels => (this.ETPLevels = ETPLevels))
    );
  }

  /* istanbul ignore next */
  public upsertETPLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.ETPLevel, 'ETP Level').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((ETPLevel: SettingsTypeModel) => {
        this.ETPLevels = Utilities.updateArray<SettingsTypeModel>(this.ETPLevels, ETPLevel, {
          replace: !isAddRequest,
          predicate: t => t.id === ETPLevel.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getETPMainDescents(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.ETPMainDescent,
      this.ETPMainDescents,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(ETPMainDescents => (this.ETPMainDescents = ETPMainDescents)));
  }

  /* istanbul ignore next */
  public upsertETPMainDescent(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.ETPMainDescent, 'ETP Main Descent').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((ETPMainDescent: SettingsTypeModel) => {
        this.ETPMainDescents = Utilities.updateArray<SettingsTypeModel>(this.ETPMainDescents, ETPMainDescent, {
          replace: !isAddRequest,
          predicate: t => t.id === ETPMainDescent.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getETPAltDescents(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.etpAltDescent,
      this.etpAltDescentProfiles,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(etpAltDescentProfiles => (this.etpAltDescentProfiles = etpAltDescentProfiles)));
  }

  /* istanbul ignore next */
  public upsertETPAltDescent(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddSourceType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.etpAltDescent, 'ETP Alt Descent').pipe(
      tapWithAction((etpAltDescentProfiles: SettingsTypeModel) => {
        this.etpAltDescentProfiles = Utilities.updateArray<SettingsTypeModel>(
          this.etpAltDescentProfiles,
          etpAltDescentProfiles,
          {
            replace: !isAddSourceType,
            predicate: t => t.id === etpAltDescentProfiles.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getETPFinalDescents(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.ETPFinalDescent,
      this.ETPFinalDescents,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(ETPFinalDescents => (this.ETPFinalDescents = ETPFinalDescents)));
  }

  /* istanbul ignore next */
  public upsertETPFinalDescent(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.ETPFinalDescent, 'ETP Final Descent').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((ETPFinalDescent: SettingsTypeModel) => {
        this.ETPFinalDescents = Utilities.updateArray<SettingsTypeModel>(this.ETPFinalDescents, ETPFinalDescent, {
          replace: !isAddRequest,
          predicate: t => t.id === ETPFinalDescent.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getETPCruiseProfiles(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.ETPCruiseProfile,
      this.ETPCruiseProfiles,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(ETPCruiseProfiles => (this.ETPCruiseProfiles = ETPCruiseProfiles)));
  }

  /* istanbul ignore next */
  public upsertETPCruiseProfile(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.ETPCruiseProfile, 'ETP Cruise Profile').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((ETPCruiseProfile: SettingsTypeModel) => {
        this.ETPCruiseProfiles = Utilities.updateArray<SettingsTypeModel>(this.ETPCruiseProfiles, ETPCruiseProfile, {
          replace: !isAddRequest,
          predicate: t => t.id === ETPCruiseProfile.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getETPHoldMethods(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.ETPHoldMethod,
      this.ETPHoldMethods,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(ETPHoldMethods => (this.ETPHoldMethods = ETPHoldMethods)));
  }

  /* istanbul ignore next */
  public upsertETPHoldMethod(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.ETPHoldMethod, 'ETP Hold Method').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((ETPHoldMethod: SettingsTypeModel) => {
        this.ETPHoldMethods = Utilities.updateArray<SettingsTypeModel>(this.ETPHoldMethods, ETPHoldMethod, {
          replace: !isAddRequest,
          predicate: t => t.id === ETPHoldMethod.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getETPPenaltyBias(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.ETPPenaltyBiasType,
      this.ETPPenaltyBias,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(ETPPenaltyBias => (this.ETPPenaltyBias = ETPPenaltyBias)));
  }

  /* istanbul ignore next */
  public upsertETPPenaltyBias(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.ETPPenaltyBiasType, 'ETP Penalty Bias').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((ETPPenaltyBias: SettingsTypeModel) => {
        this.ETPPenaltyBias = Utilities.updateArray<SettingsTypeModel>(this.ETPPenaltyBias, ETPPenaltyBias, {
          replace: !isAddRequest,
          predicate: t => t.id === ETPPenaltyBias.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getETPPenaltyApply(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.ETPPenaltyApply,
      this.ETPPenaltyApply,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(ETPPenaltyApply => (this.ETPPenaltyApply = ETPPenaltyApply)));
  }

  /* istanbul ignore next */
  public upsertETPPenaltyApply(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.ETPPenaltyApply, 'ETP Penalty Apply').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((ETPPenaltyApply: SettingsTypeModel) => {
        this.ETPPenaltyApply = Utilities.updateArray<SettingsTypeModel>(this.ETPPenaltyApply, ETPPenaltyApply, {
          replace: !isAddRequest,
          predicate: t => t.id === ETPPenaltyApply.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getETPAPUBurnMethods(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.ETPAPUBurnMethod,
      this.ETPAPUBurnMethods,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(ETPAPUBurnMethods => (this.ETPAPUBurnMethods = ETPAPUBurnMethods)));
  }

  /* istanbul ignore next */
  public upsertETPAPUBurnMethod(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.ETPAPUBurnMethod, 'ETP APU Burn Method').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((ETPAPUBurnMethod: SettingsTypeModel) => {
        this.ETPAPUBurnMethods = Utilities.updateArray<SettingsTypeModel>(this.ETPAPUBurnMethods, ETPAPUBurnMethod, {
          replace: !isAddRequest,
          predicate: t => t.id === ETPAPUBurnMethod.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getETPPenaltyCategories(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.ETPPenaltyCategory,
      this.ETPPenaltyCategories,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(
      map(response => Utilities.customArraySort<SettingsTypeModel>(response, 'name')),
      tapWithAction(ETPPenaltyCategories => (this.ETPPenaltyCategories = ETPPenaltyCategories))
    );
  }

  /* istanbul ignore next */
  public upsertETPPenaltyCategory(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.ETPPenaltyCategory, 'ETP Penalty Category').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((ETPPenaltyCategory: SettingsTypeModel) => {
        this.ETPPenaltyCategories = Utilities.updateArray<SettingsTypeModel>(
          this.ETPPenaltyCategories,
          ETPPenaltyCategory,
          {
            replace: !isAddRequest,
            predicate: t => t.id === ETPPenaltyCategory.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getETPPenaltyTypeFields(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.etpPenaltyTypeField,
      this.etpPenaltyTypeFields,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(etpPenaltyTypeFields => (this.etpPenaltyTypeFields = etpPenaltyTypeFields)));
  }

  /* istanbul ignore next */
  public upsertETPPenaltyTypeField(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.etpPenaltyTypeField, 'ETP Penalty Type Field').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((ETPPenaltyTypeField: SettingsTypeModel) => {
        this.etpPenaltyTypeFields = Utilities.updateArray<SettingsTypeModel>(
          this.etpPenaltyTypeFields,
          ETPPenaltyTypeField,
          {
            replace: !isAddRequest,
            predicate: t => t.id === ETPPenaltyTypeField.id,
          }
        );
      })
    );
  }

  public loadEtpSettings(): Observable<
    [
      [SettingsTypeModel[], SettingsTypeModel[], SettingsTypeModel[]],
      [SettingsTypeModel[], SettingsTypeModel[], SettingsTypeModel[]],
      [SettingsTypeModel[], SettingsTypeModel[], SettingsTypeModel[]],
      [SettingsTypeModel[], SettingsTypeModel[]],
      [SettingsTypeModel[], SettingsTypeModel[]]
    ]
    > {
    return forkJoin([
      this.loadInitialDescentSettings(),
      this.loadEtpScenarioSettings(),
      this.loadEtpPenaltySettings(),
      this.loadCruiseAndApuSettings(),
      this.loadHoldAndDescentSettins(),
    ]);
  }

  private loadInitialDescentSettings(): Observable<[SettingsTypeModel[], SettingsTypeModel[], SettingsTypeModel[]]> {
    return forkJoin([ this.getETPMainDescents(), this.getETPAltDescents(), this.getETPLevels() ]);
  }

  private loadEtpScenarioSettings(): Observable<[SettingsTypeModel[], SettingsTypeModel[], SettingsTypeModel[]]> {
    return forkJoin([ this.getETPScenarioEngines(), this.getETPScenarioTypes(), this.getETPTimeLimitTypes() ]);
  }

  private loadEtpPenaltySettings(): Observable<[SettingsTypeModel[], SettingsTypeModel[], SettingsTypeModel[]]> {
    return forkJoin([ this.getETPPenaltyApply(), this.getETPPenaltyCategories(), this.getETPPenaltyBias() ]);
  }

  private loadCruiseAndApuSettings(): Observable<[SettingsTypeModel[], SettingsTypeModel[]]> {
    return forkJoin([ this.getETPAPUBurnMethods(), this.getETPCruiseProfiles() ]);
  }

  private loadHoldAndDescentSettins(): Observable<[SettingsTypeModel[], SettingsTypeModel[]]> {
    return forkJoin([ this.getETPHoldMethods(), this.getETPFinalDescents() ]);
  }
}
