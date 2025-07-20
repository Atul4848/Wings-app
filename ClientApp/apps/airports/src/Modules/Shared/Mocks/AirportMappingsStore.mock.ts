import { Observable, of } from 'rxjs';
import { IAPIPageResponse } from '@wings-shared/core';
import { AirportMappingStore } from '../Stores';
import { AirportMappingsModel } from '../Models';

export class AirportMappingsStoreMock extends AirportMappingStore {
  public loadAirportMappings(): Observable<IAPIPageResponse<AirportMappingsModel>> {
    return of({
      pageNumber: 1,
      pageSize: 10,
      totalNumberOfRecords: 1,
      results: [ new AirportMappingsModel() ],
    });
  }

  public removeAirportMapping(icao: string): Observable<string> {
    return of('');
  }

  public upsertAirportMapping(airportHours: AirportMappingsModel): Observable<boolean> {
    return of(true);
  }

  public ValidateIcaoCode(value: string): Observable<boolean> {
    return of(true);
  }
}
