import { Observable, of } from 'rxjs';
import { EntityMapStore } from '../Stores';
import { EntityMapModel } from '@wings-shared/core';
import { tap } from 'rxjs/operators';

export class EntityMapStoreMock extends EntityMapStore {
  public getCustomsLocationInformation(): Observable<EntityMapModel[]> {
    return of([ new EntityMapModel(), new EntityMapModel() ]).pipe(
      tap((customLocation: EntityMapModel[]) => {
        this.customLocation = customLocation;
      })
    );
  }

  public getMaxPOBOptions(): Observable<EntityMapModel[]> {
    return of([ new EntityMapModel(), new EntityMapModel() ]).pipe(
      tap((maxPOBOptions: EntityMapModel[]) => {
        this.maxPOBOptions = maxPOBOptions;
      })
    );
  }

  public loadEntities(fieldKey: string): Observable<EntityMapModel[]> {
    return of([ new EntityMapModel(), new EntityMapModel() ]);
  }

  public getSecurityMeasures(): Observable<EntityMapModel[]> {
    return of([ new EntityMapModel(), new EntityMapModel() ]).pipe(
      tap((entities: EntityMapModel[]) => {
        this.securityMeasures = entities;
      })
    );
  }

  /* istanbul ignore next */
  public getSecurityServices(): Observable<EntityMapModel[]> {
    return of([ new EntityMapModel(), new EntityMapModel() ]).pipe(
      tap((entities: EntityMapModel[]) => {
        this.recommendedServices = entities;
      })
    );
  }

  /* istanbul ignore next */
  public getRampSideAccess3rdPartyVendors(): Observable<EntityMapModel[]> {
    return of([ new EntityMapModel(), new EntityMapModel() ]).pipe(
      tap((entities: EntityMapModel[]) => {
        this.rampSideAccess3rdPartyVendors = entities;
      })
    );
  }

  /* istanbul ignore next */
  public getFuelTypes(): Observable<EntityMapModel[]> {
    return of([ new EntityMapModel(), new EntityMapModel() ]).pipe(
      tap((entities: EntityMapModel[]) => {
        this.fuelTypes = entities;
      })
    );
  }

  /* istanbul ignore next */
  public getOilTypes(): Observable<EntityMapModel[]> {
    return of([ new EntityMapModel(), new EntityMapModel() ]).pipe(
      tap((entities: EntityMapModel[]) => {
        this.oilTypes = entities;
      })
    );
  }

  /* istanbul ignore next */
  public getAirportTypes(): Observable<EntityMapModel[]> {
    return of([ new EntityMapModel(), new EntityMapModel() ]).pipe(
      tap((entities: EntityMapModel[]) => {
        this.airportTypes = entities;
      })
    );
  }

  /* istanbul ignore next */
  public getUsageTypes(): Observable<EntityMapModel[]> {
    return of([ new EntityMapModel(), new EntityMapModel() ]).pipe(
      tap((entities: EntityMapModel[]) => {
        this.usageTypes = entities;
      })
    );
  }

  public searchEntities(searchValue: string, fieldKey: string): Observable<EntityMapModel[]> {
    return of([ new EntityMapModel(), new EntityMapModel() ]);
  }
}
