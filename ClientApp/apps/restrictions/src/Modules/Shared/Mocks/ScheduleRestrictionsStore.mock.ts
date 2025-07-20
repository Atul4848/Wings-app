import { Observable, of } from 'rxjs';
import { IAPIScheduleRestrictions } from '../Interfaces';
import { ScheduleRestrictionsModel } from '../Models';
import { ScheduleRestrictionsStore } from '../Stores';
import { CountryModel, StateModel, FIRModel } from '@wings/shared';
import { tap } from 'rxjs/operators';
import { IAPIGridRequest, IAPIPageResponse, tapWithAction } from '@wings-shared/core';

export class ScheduleRestrictionsStoreMock extends ScheduleRestrictionsStore {
  /* istanbul ignore next */
  public getScheduleRestrictions(request?: IAPIGridRequest): Observable<IAPIPageResponse<ScheduleRestrictionsModel>> {
    const results: ScheduleRestrictionsModel[] = [ new ScheduleRestrictionsModel({ id: 2, name: 'test' }) ];
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results }).pipe(
      tapWithAction(response => (this.scheduleRestrictions = response.results))
    );
  }

  /* istanbul ignore next */
  public upsertScheduleRestrictions(requestModel?: IAPIScheduleRestrictions): Observable<ScheduleRestrictionsModel> {
    return of(new ScheduleRestrictionsModel());
  }

  public getCountries(request?: IAPIGridRequest, forceRefresh?: boolean): Observable<CountryModel[]> {
    const results: CountryModel[] = [ new CountryModel(), new CountryModel() ];
    return of(results).pipe(tap(response => (this.countries = response)));
  }

  public getStates(request?: IAPIGridRequest, forceRefresh?: boolean): Observable<StateModel[]> {
    const results: StateModel[] = [ new StateModel(), new StateModel() ];
    return of(results).pipe(tap(response => (this.states = response)));
  }

  public getFIRs(): Observable<FIRModel[]> {
    return of([ new FIRModel(), new FIRModel() ]).pipe(tap(response => (this.firs = response)));
  }
}
