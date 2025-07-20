import { SettingsStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { SecurityThreatLevelModel } from '../Models';
import { CAPPSTerritoryTypeModel, FARTypeModel } from '@wings/shared';
import { tap } from 'rxjs/operators';
import { Utilities, SettingsTypeModel } from '@wings-shared/core';

export class SettingsStoreMock extends SettingsStore {
  public getStateTypes(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((stateTypes: SettingsTypeModel[]) => {
        this.stateTypes = stateTypes;
      })
    );
  }

  public upsertStateType(stateType: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getCAPPSTerritoryType(): Observable<CAPPSTerritoryTypeModel[]> {
    return of([ new CAPPSTerritoryTypeModel(), new CAPPSTerritoryTypeModel() ]).pipe(
      tap((cappsTerritoryTypes: CAPPSTerritoryTypeModel[]) => {
        this.cappsTerritoryTypes = cappsTerritoryTypes;
      })
    );
  }

  public upsertCAPPSTerritoryType(request: CAPPSTerritoryTypeModel): Observable<CAPPSTerritoryTypeModel> {
    return of(new CAPPSTerritoryTypeModel()).pipe(
      tap((cappsTerritoryType: CAPPSTerritoryTypeModel) => {
        this.cappsTerritoryTypes = Utilities.updateArray<CAPPSTerritoryTypeModel>(
          this.cappsTerritoryTypes,
          cappsTerritoryType,
          {
            replace: true,
            predicate: t => t.id === cappsTerritoryType.id,
          }
        );
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
    return of(new SettingsTypeModel());
  }

  public getSourceTypes(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((sourceTypes: SettingsTypeModel[]) => {
        this.sourceTypes = sourceTypes;
      })
    );
  }

  public upsertSourceType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getRegionTypes(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((regionTypes: SettingsTypeModel[]) => {
        this.regionTypes = regionTypes;
      })
    );
  }

  public upsertRegionType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getTerritoryTypes(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((territoryTypes: SettingsTypeModel[]) => {
        this.territoryTypes = territoryTypes;
      })
    );
  }

  public upsertTerritoryType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  } 

  public getSecurityThreatLevels(forceRefresh?: boolean): Observable<SecurityThreatLevelModel[]> {
    return of([ new SecurityThreatLevelModel(), new SecurityThreatLevelModel() ]).pipe(
      tap((securityThreatLevels: SecurityThreatLevelModel[]) => {
        this.securityThreatLevels = securityThreatLevels;
      })
    );
  }

  public upsertSecurityThreatLevel(request: SecurityThreatLevelModel): Observable<SecurityThreatLevelModel> {
    return of(new SecurityThreatLevelModel()).pipe(
      tap((securityThreatLevel: SecurityThreatLevelModel) => {
        this.securityThreatLevels = Utilities.updateArray<SecurityThreatLevelModel>(
          this.securityThreatLevels,
          securityThreatLevel,
          {
            replace: true,
            predicate: t => t.id === securityThreatLevel.id,
          }
        );
      })
    );
  }

  public getAIPSourceTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((aipSourceTypes: SettingsTypeModel[]) => {
        this.aipSourceTypes = aipSourceTypes;
      })
    );
  }

  public upsertAIPSourceTypes(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getCabotageExemptionLevels(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((cabotageExemptionLevels: SettingsTypeModel[]) => {
        this.cabotageExemptionLevels = cabotageExemptionLevels;
      })
    );
  }
  
  /* istanbul ignore next */
  public getFarTypes(forceRefresh?: boolean): Observable<FARTypeModel[]> {
    return of([ new FARTypeModel(), new FARTypeModel() ]).pipe(
      tap((farType: FARTypeModel[]) => {
        this.farTypes = farType;
      })
    );
  }
}
