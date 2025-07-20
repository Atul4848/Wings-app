import { Observable, of } from 'rxjs';
import { TimeZoneSettingsStore } from '../Stores';
import { tap } from 'rxjs/operators';
import { UAOfficesModel, WorldAwareModel } from '../Models';
import { Utilities, SettingsTypeModel } from '@wings-shared/core';

export class TimeZoneSettingsStoreMock extends TimeZoneSettingsStore {
  public getWorldEventTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((worldEventTypes: SettingsTypeModel[]) => {
        this.worldEventTypes = worldEventTypes;
      })
    );
  }

  public upsertWorldEventTypes(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
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

  public getWorldAwares(forceRefresh?: boolean): Observable<WorldAwareModel[]> {
    return of([ new WorldAwareModel(), new WorldAwareModel() ]).pipe(
      tap((worldAwares: WorldAwareModel[]) => {
        this.worldAwares = worldAwares;
      })
    );
  }

  public upsertWorldAware(request: WorldAwareModel): Observable<WorldAwareModel> {
    return of(new WorldAwareModel()).pipe(
      tap((worldAware: WorldAwareModel) => {
        this.worldAwares = Utilities.updateArray<WorldAwareModel>(this.worldAwares, worldAware, {
          replace: true,
          predicate: t => t.id === worldAware.id,
        });
      })
    );
  }

  public getWorldEventCategory(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((worldEventCategories: SettingsTypeModel[]) => {
        this.worldEventCategories = worldEventCategories;
      })
    );
  }

  public upsertUAOffices(request: UAOfficesModel): Observable<UAOfficesModel> {
    return of(new UAOfficesModel()).pipe(
      tap((uaOffices: UAOfficesModel) => {
        this.uaOffices = Utilities.updateArray<UAOfficesModel>(this.uaOffices, uaOffices, {
          replace: true,
          predicate: t => t.id === uaOffices.id,
        });
      })
    );
  }
  public upsertWorldEventCategory(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getWorldEventSpecialConsiderations(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((worldEventSpecialConsiderations: SettingsTypeModel[]) => {
        this.worldEventSpecialConsiderations = worldEventSpecialConsiderations;
      })
    );
  }

  public upsertWorldEventSpecialConsideration(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public loadUAOffices(forceRefresh?: boolean): Observable<UAOfficesModel[]> {
    return of([ new UAOfficesModel(), new UAOfficesModel() ]).pipe(
      tap((uaOffices: UAOfficesModel[]) => {
        this.uaOffices = uaOffices;
      })
    );
  }
}
