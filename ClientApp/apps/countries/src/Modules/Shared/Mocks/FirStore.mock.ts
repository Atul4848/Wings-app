import { FIRStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { FIRModel } from '../Models';
import { IAPIGridRequest, IAPIPageResponse } from '@wings-shared/core';

export class FirStoreMock extends FIRStore {
  public getFIRsOwned(request: IAPIGridRequest): Observable<IAPIPageResponse<FIRModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new FIRModel(), new FIRModel() ],
    });
  }
  public upsertFIRControllingCountry(fir: FIRModel): Observable<FIRModel> {
    return of(new FIRModel());
  }
}
