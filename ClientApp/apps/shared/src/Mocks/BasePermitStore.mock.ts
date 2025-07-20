import { Observable, of } from 'rxjs';
import { BasePermitStore } from '@wings/shared';
import { EntityMapModel } from '@wings-shared/core';
import { tap } from 'rxjs/operators';

export class BasePermitStoreMock extends BasePermitStore {
  public getRvsmComplianceExceptions(): Observable<EntityMapModel[]> {
    return of([ new EntityMapModel(), new EntityMapModel() ]).pipe(
      tap((purposeOfFlight: EntityMapModel[]) => {
        this.purposeOfFlight = purposeOfFlight;
      })
    );
  }

  public getFlightOperationalCategories(): Observable<EntityMapModel[]> {
    return of([ new EntityMapModel(), new EntityMapModel() ]).pipe(
      tap((flightOperationalCategories: EntityMapModel[]) => {
        this.flightOperationalCategories = flightOperationalCategories;
      })
    );
  }
}
