import { Observable, of } from 'rxjs';
import { IAPIRetailDataOptionsResponse } from '../Interfaces';
import { RetailDataModel } from '../Models';
import { RetailDataStore } from '../Stores';

export class RetailDataStoreMock extends RetailDataStore {
  public getRetailData(): Observable<RetailDataModel[]> {
    return of([ new RetailDataModel(), new RetailDataModel() ])
  }

  public upsertRetailData(retailDataOptions: IAPIRetailDataOptionsResponse): Observable<RetailDataModel> {
    return of(new RetailDataModel());
  }

}