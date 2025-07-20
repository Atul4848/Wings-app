import { AirportTimeZoneMappingStore, TimeZoneDetailStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { AirportLocationModel, AirportTimeZoneMappingModel, TimeZoneModel } from '../Models';
import { IAPIGridRequest, IAPIPageResponse } from '@wings-shared/core';
import { IAPIAirportLocation } from '../Interfaces';

export class AirportTimeZoneMappingStoreMock extends AirportTimeZoneMappingStore {
  public getAirportTimeZoneMapping(
    request?: IAPIGridRequest
  ): Observable<IAPIPageResponse<AirportTimeZoneMappingModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new AirportTimeZoneMappingModel(), new AirportTimeZoneMappingModel() ],
    });
  }

  public upsertAirportTimeZoneMapping(airport: AirportTimeZoneMappingModel): Observable<AirportTimeZoneMappingModel> {
    return of(new AirportTimeZoneMappingModel());
  }

  public removeAirportTimeZoneMapping(id: number): Observable<string> {
    return of('Success');
  }
}
