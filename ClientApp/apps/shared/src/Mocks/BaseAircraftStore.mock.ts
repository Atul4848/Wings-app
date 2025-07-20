import { Observable, of } from 'rxjs';
import { BaseAircraftStore } from '@wings/shared';
import { EntityMapModel } from '@wings-shared/core';
import { tap } from 'rxjs/operators';

export class BaseAircraftStoreMock extends BaseAircraftStore {
  public getBannedAircraft(): Observable<EntityMapModel[]> {
    return of([ new EntityMapModel(), new EntityMapModel() ]).pipe(
      tap((bannedAircraft: EntityMapModel[]) => {
        this.bannedAircraft = bannedAircraft;
      })
    );
  }

  public getNoiseRestrictedAircraft(): Observable<EntityMapModel[]> {
    return of([ new EntityMapModel(), new EntityMapModel() ]).pipe(
      tap((noiseChapters: EntityMapModel[]) => {
        this.noiseChapters = noiseChapters;
      })
    );
  }
}