import { TimeZoneDetailStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { AirportLocationModel, TimeZoneModel } from '../Models';
import { IAPIGridRequest } from '@wings-shared/core';
import { IAPIAirportLocation } from '../Interfaces';

export class TimeZoneDetailStoreMock extends TimeZoneDetailStore {
  public setAirportTimeZones(airportTimeZones: AirportLocationModel[]): AirportLocationModel[] {
    return [ new AirportLocationModel(), new AirportLocationModel() ];
  }

  public getAirportTimeZones(request?: IAPIGridRequest): Observable<AirportLocationModel[]> {
    return of([ new AirportLocationModel(), new AirportLocationModel() ]);
  }

  public loadAirportTimeZones(airportId: number): Observable<TimeZoneModel[]> {
    this.timeZones = [ new TimeZoneModel() ];
    this.setFilteredTimeZones();
    return of(this.timeZones);
  }

  public upsertAirportTimezone(request: IAPIAirportLocation): Observable<AirportLocationModel> {
    return of(new AirportLocationModel());
  }

}
