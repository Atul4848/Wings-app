import { Observable, of } from 'rxjs';
import { ServicesModel } from '../Models';
import { ServicesStore } from '../Stores';
import { IAPIGridRequest, IAPIPageResponse } from '@wings-shared/core';

export class ServicesStoreMock extends ServicesStore {
  public getServices(request?: IAPIGridRequest): Observable<IAPIPageResponse<ServicesModel>> {
    return of({
      pageNumber: 1,
      pageSize: 1,
      totalNumberOfRecords: 1,
      results: [ new ServicesModel(), new ServicesModel() ],
    })
  }

  public deleteService(id: string): Observable<boolean> {
    return of(true);
  }

  public upsertService(service: ServicesModel): Observable<boolean> {
    return of(true);
  }

}