import { EtpSettingsStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Utilities, SettingsTypeModel } from '@wings-shared/core';

export class EtpSettingsStoreMock extends EtpSettingsStore {
  public upsertETPScenarioType(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1, name: 'scenario' })).pipe(
      tap((etpScenarioTypes: SettingsTypeModel) => {
        this.etpScenarioTypes = Utilities.updateArray<SettingsTypeModel>(this.etpScenarioTypes, etpScenarioTypes, {
          replace: true,
          predicate: t => t.id === etpScenarioTypes.id,
        });
      })
    );
  }

  public getETPScenarioTypes(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((etpScenarioTypes: SettingsTypeModel[]) => (this.etpScenarioTypes = etpScenarioTypes))
    );
  }

  public getETPTimeLimitTypes(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((etpTimeLimitTypes: SettingsTypeModel[]) => (this.etpTimeLimitTypes = etpTimeLimitTypes))
    );
  }

  public upsertETPTimeLimitType(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1, name: 'Time Limit' })).pipe(
      tap((etpTimeLimitTypes: SettingsTypeModel) => {
        this.etpTimeLimitTypes = Utilities.updateArray<SettingsTypeModel>(this.etpTimeLimitTypes, etpTimeLimitTypes, {
          replace: true,
          predicate: t => t.id === etpTimeLimitTypes.id,
        });
      })
    );
  }

  public getETPScenarioEngines(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((ETPScenarioEngines: SettingsTypeModel[]) => (this.ETPScenarioEngines = ETPScenarioEngines))
    );
  }

  public upsertETPScenarioEngine(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getETPLevels(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((ETPLevels: SettingsTypeModel[]) => (this.ETPLevels = ETPLevels))
    );
  }

  public upsertETPLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getETPMainDescents(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((ETPMainDescents: SettingsTypeModel[]) => (this.ETPMainDescents = ETPMainDescents))
    );
  }

  public upsertETPMainDescent(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getETPFinalDescents(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((ETPFinalDescents: SettingsTypeModel[]) => (this.ETPFinalDescents = ETPFinalDescents))
    );
  }

  public upsertETPFinalDescent(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getETPCruiseProfiles(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((ETPCruiseProfiles: SettingsTypeModel[]) => (this.ETPCruiseProfiles = ETPCruiseProfiles))
    );
  }

  public upsertETPCruiseProfile(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getETPHoldMethods(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((ETPHoldMethods: SettingsTypeModel[]) => (this.ETPHoldMethods = ETPHoldMethods))
    );
  }

  public upsertETPHoldMethod(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getETPPenaltyBias(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((ETPPenaltyBias: SettingsTypeModel[]) => (this.ETPPenaltyBias = ETPPenaltyBias))
    );
  }

  public upsertETPPenaltyBias(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getETPPenaltyApply(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((ETPPenaltyApplyFields: SettingsTypeModel[]) => (this.ETPPenaltyApply = ETPPenaltyApplyFields))
    );
  }

  public upsertETPPenaltyApply(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getETPAPUBurnMethods(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((ETPAPUBurnMethods: SettingsTypeModel[]) => (this.ETPAPUBurnMethods = ETPAPUBurnMethods))
    );
  }

  public upsertETPAPUBurnMethod(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getETPPenaltyCategories(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((ETPPenaltyCategories: SettingsTypeModel[]) => (this.ETPPenaltyCategories = ETPPenaltyCategories))
    );
  }

  public upsertETPPenaltyCategory(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getETPPenaltyTypeFields(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((etpPenaltyTypeFields: SettingsTypeModel[]) => (this.etpPenaltyTypeFields = etpPenaltyTypeFields))
    );
  }

  public upsertETPPenaltyTypeField(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getETPAltDescents(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((etpAltDescents: SettingsTypeModel[]) => (this.etpAltDescentProfiles = etpAltDescents))
    );
  }

  public upsertETPAltDescent(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

}
