import { Observable, of } from 'rxjs';
import { AirportModel, StagingAirportTimezoneModel, TimeZoneModel } from '../Models';
import { APPROVE_REJECT_ACTIONS } from '../Enums';
import { TimeZoneStoreMock } from './TimeZoneStore.mock';

export class TimeZoneReviewStoreMock extends TimeZoneStoreMock {
  public refreshTimeZones(): Observable<string> {
    return of('');
  }

  public approveRejectTimeZones(timeZoneIds: number[], action: APPROVE_REJECT_ACTIONS): Observable<string[]> {
    return of([ '', '' ]);
  }

  public approveRejectStagingAirportTimezones(
    stagingAirportRegionIds: number[],
    action: APPROVE_REJECT_ACTIONS
  ): Observable<string[]> {
    return of([ '', '' ]);
  }

  public getTimeZoneAirports(isStagingTimeZones: boolean, id: number): Observable<AirportModel[]> {
    return of([ new AirportModel(), new AirportModel() ]);
  }

  public approveRejectAirportLocations(
    stagingAirportLocationIds: number[],
    action: APPROVE_REJECT_ACTIONS
  ): Observable<string[]> {
    return of([ '', '' ]);
  }

  public loadInitialTimeZoneData(isStagingTimeZones: boolean = false): Observable<TimeZoneModel[]> {
    this.timeZones = [ new TimeZoneModel(), new TimeZoneModel() ];
    return of(this.timeZones);
  }

  public loadInitialAirportTimeZoneData(): Observable<StagingAirportTimezoneModel[]> {
    this.stagingAirportTimeZones = [ new StagingAirportTimezoneModel(), new StagingAirportTimezoneModel() ];
    return of(this.stagingAirportTimeZones);
  }

  public loadTimeZones(isStagingTimeZones: boolean): Observable<TimeZoneModel[]> {
    return of([ new TimeZoneModel(), new TimeZoneModel() ]);
  }
}
