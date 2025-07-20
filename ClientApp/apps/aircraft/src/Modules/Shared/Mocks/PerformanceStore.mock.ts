import { PerformanceStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { PerformanceModel } from '../Models';
import { tap } from 'rxjs/operators';
import { IAPIGridRequest, IAPIPageResponse } from '@wings-shared/core';

export class PerformanceStoreMock extends PerformanceStore {
  public getPerformances(): Observable<IAPIPageResponse<PerformanceModel>> {
    return of({
      pageNumber: 1,
      pageSize: 10,
      totalNumberOfRecords: 2,
      results: [ new PerformanceModel(), new PerformanceModel() ],
    }).pipe(tap(performances => (this.performances = performances.results)));
  }

  public getPerformanceById(request?: IAPIGridRequest): Observable<PerformanceModel> {
    return of(new PerformanceModel());
  }

  public upsertPerformance(performance: PerformanceModel): Observable<PerformanceModel> {
    return of(new PerformanceModel({ name: 'test', id: 1 }));
  }
}
