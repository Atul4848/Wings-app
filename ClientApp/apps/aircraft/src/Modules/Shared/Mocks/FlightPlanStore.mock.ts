import { FlightPlanStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { FlightPlanFormatAccountModel, FlightPlanModel, FlightPlanChangeRecordModel } from '../Models';
import { tap } from 'rxjs/operators';
import { IAPIGridRequest, IAPIPageResponse } from '@wings-shared/core';

export class FlightPlanStoreMock extends FlightPlanStore {
  public getFlightPlans(forceRefresh?: boolean): Observable<IAPIPageResponse<FlightPlanModel>> {
    const results: FlightPlanModel[] = [ new FlightPlanModel() ];
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results }).pipe(
      tap(response => (this.flightPlans = response.results))
    );
  }

  public getFlightPlanById(request?: IAPIGridRequest): Observable<IAPIPageResponse<FlightPlanModel>> {
    const results: FlightPlanModel[] = [ new FlightPlanModel() ];
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results });
  }

  public getFlightPlanChnageRecords(): Observable<FlightPlanChangeRecordModel[]> {
    return of([ new FlightPlanChangeRecordModel() ]);
  }

  public upsertFlightPlan(flightPlan: FlightPlanModel): Observable<FlightPlanModel> {
    return of(
      new FlightPlanModel({
        name: 'test',
        id: 1,
        flightPlanFormatAccounts: [ new FlightPlanFormatAccountModel({ id: 1, name: 'test' }) ],
      })
    );
  }
}
