import { Observable, of } from 'rxjs';
import { IAPIAircraftOperatorRestrictions } from '../Interfaces';
import { AircraftOperatorRestrictionsModel } from '../Models';
import { AircraftOperatorRestrictionsStore } from '../Stores';
import { CountryModel } from '@wings/shared';
import { tap } from 'rxjs/operators';
import { AuditHistoryModel, IAPIGridRequest, IAPIPageResponse, tapWithAction } from '@wings-shared/core';

export class AircraftOperatorRestrictionsStoreMock extends AircraftOperatorRestrictionsStore {
  /* istanbul ignore next */
  public getAircraftOperatorRestrictions(
    request?: IAPIGridRequest
  ): Observable<IAPIPageResponse<AircraftOperatorRestrictionsModel>> {
    const results: AircraftOperatorRestrictionsModel[] = [
      new AircraftOperatorRestrictionsModel({ id: 2, name: 'test' }),
    ];
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results }).pipe(
      tapWithAction(response => (this.aircraftOperatorRestrictions = response.results))
    );
  }

  /* istanbul ignore next */
  public upsertAircraftOperatorRestrictions(
    requestModel: IAPIAircraftOperatorRestrictions
  ): Observable<AircraftOperatorRestrictionsModel> {
    return of(new AircraftOperatorRestrictionsModel());
  }

  public getCountries(request?: IAPIGridRequest): Observable<IAPIPageResponse<CountryModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new CountryModel({ commonName: 'TEST' }), new CountryModel() ],
    }).pipe(tap((response: IAPIPageResponse<CountryModel>) => (this.countries = response.results)));
  }
  
  /* istanbul ignore next */
  public loadAuditHistory(id: number, entityName: string): Observable<AuditHistoryModel[]> {
    return of([ new AuditHistoryModel({ id: 1 }) ]);
  }
}
