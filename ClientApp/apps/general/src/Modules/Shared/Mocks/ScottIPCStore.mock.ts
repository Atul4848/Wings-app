import { Observable, of } from 'rxjs';
import { IAPIUpsertScottIPCRequest } from '../Interfaces';
import { ScottIPCModel } from '../Models';
import { ScottIPCStore } from '../Stores';
import { IAPIGridRequest, IAPIPageResponse } from '@wings-shared/core';

export class ScottIPCStoreMock extends ScottIPCStore {
  public getScottIpc(request?: IAPIGridRequest): Observable<IAPIPageResponse<ScottIPCModel>> {
    return of({
      pageNumber: 1,
      pageSize: 1,
      totalNumberOfRecords: 1,
      results: [ new ScottIPCModel(), new ScottIPCModel() ],
    })
  }

  public upsertScottIpc(request: IAPIUpsertScottIPCRequest): Observable<ScottIPCModel> {
    return of(new ScottIPCModel());
  }

  public deleteScottIpc(Id: string): Observable<boolean> {
    return of(true);
  }
}