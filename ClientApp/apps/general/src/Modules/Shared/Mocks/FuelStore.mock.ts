import { Observable, of } from 'rxjs';
import { IAPIUpsertFuelRequest } from '../Interfaces';
import { FuelModel } from '../Models';
import { FuelStore } from '../Stores';
import { IAPIGridRequest, IAPIPageResponse } from '@wings-shared/core';

export class FuelStoreMock extends FuelStore {
  public getFuel(request?: IAPIGridRequest): Observable<IAPIPageResponse<FuelModel>> {
    return of({
      pageNumber: 1,
      pageSize: 1,
      totalNumberOfRecords: 1,
      results: [ new FuelModel(), new FuelModel() ],
    })
  }

  public upsertFuel(request: IAPIUpsertFuelRequest): Observable<FuelModel> {
    return of(new FuelModel());
  }

  public deleteFuel(Id: string): Observable<boolean> {
    return of(true);
  }
}