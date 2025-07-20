import { GenericRegistryStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { GenericRegistryModel } from '../Models';
import { tap } from 'rxjs/operators';
import { IAPIGridRequest, IAPIPageResponse } from '@wings-shared/core';

export class GenericRegistryStoreMock extends GenericRegistryStore {
  public getGenericRegistries(forceRefresh?: boolean): Observable<IAPIPageResponse<GenericRegistryModel>> {
    const results: GenericRegistryModel[] = [ new GenericRegistryModel() ];
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results }).pipe(
      tap(response => (this.genericRegistries = response.results))
    );
  }

  public upsertGenericRegistry(request: GenericRegistryModel): Observable<GenericRegistryModel> {
    return of(
      new GenericRegistryModel({
        name: 'test',
        id: 1,
      })
    );
  }

  public refreshGenericRegistry(id: number, name: string): Observable<boolean> {
    return of(true);
  }

  public getGenericRegistryById(request: IAPIGridRequest): Observable<GenericRegistryModel> {
    return of(new GenericRegistryModel());
  }
}
