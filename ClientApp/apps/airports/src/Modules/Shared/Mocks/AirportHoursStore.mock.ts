import { AirportHoursStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { AirportHoursModel, ATSAirportModel, IAPIAirportHours } from '../../Shared';
import { AirportModel } from '@wings/shared';
import { IAPIPageResponse, TimeZoneBaseModel } from '@wings-shared/core';

export class AirportHoursStoreMock extends AirportHoursStore {
  public loadAirportHours(): Observable<IAPIPageResponse<AirportHoursModel>> {
    const results: AirportHoursModel[] = [ new AirportHoursModel(), new AirportHoursModel() ];
    return of({
      pageNumber: 1,
      pageSize: 10,
      totalNumberOfRecords: 1,
      results,
    });
  }

  public upsertAirportHours(airportHours: IAPIAirportHours[]): Observable<AirportHoursModel[]> {
    return of([ new AirportHoursModel() ]);
  }

  public removeAirportHours(airportHours: AirportHoursModel): Observable<string> {
    return of('');
  }

  public getAirportTimeZones(airportId: number): Observable<TimeZoneBaseModel[]> {
    return of([ new TimeZoneBaseModel(), new TimeZoneBaseModel() ]);
  }

  public getTimeZoneById(timeZoneId: number): Observable<TimeZoneBaseModel> {
    return of(new TimeZoneBaseModel());
  }

  public getAirportCurrentTimeZone(airportId: number): Observable<TimeZoneBaseModel | null> {
    return of(new TimeZoneBaseModel({ zoneName: 'TEST' }));
  }

  public loadAirportHoursById(airportHoursId: number): Observable<AirportHoursModel> {
    return of(new AirportHoursModel());
  }

  public loadTfoAirports(): Observable<ATSAirportModel[]> {
    return of([ new ATSAirportModel({ icao: 'KHOU' }), new ATSAirportModel() ]);
  }

  public searchWingsAirports(searchValue: string): Observable<AirportModel[]> {
    return of([ new AirportModel(), new AirportModel() ]);
  }

  public searchWingsAirportsByCode(searchValue: string): Observable<AirportModel[]> {
    return of([ new AirportModel(), new AirportModel() ]);
  }
}
