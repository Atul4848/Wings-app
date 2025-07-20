import { TimeZoneStore } from '../Stores';
import { Observable, of } from 'rxjs';
import {
  AirportModel,
  CountryModel,
  LocationModel,
  StagingAirportTimezoneModel,
  StagingTimeZoneModel,
  SupplierModel,
  TimeZoneModel,
} from '../Models';
import { IAPIGridRequest, IAPIPageResponse } from '@wings-shared/core';

export class TimeZoneStoreMock extends TimeZoneStore {
  public getTimeZonesForLocation(locationId: number): Observable<TimeZoneModel[]> {
    return of([ new TimeZoneModel(), new TimeZoneModel() ]);
  }

  public loadInitialTimeZoneData(isStagingTimeZones: boolean = false): Observable<TimeZoneModel[]> {
    this.timeZones = [ new TimeZoneModel(), new TimeZoneModel() ];
    return of(this.timeZones);
  }

  public loadStagingTimeZones(): Observable<StagingTimeZoneModel[]> {
    return of([ new StagingTimeZoneModel(), new StagingTimeZoneModel() ]);
  }

  public loadStagingAirportTimeZones(): Observable<StagingAirportTimezoneModel[]> {
    return of([ new StagingAirportTimezoneModel(), new StagingAirportTimezoneModel() ]);
  }

  public updateStagingTimezoneRegion(): Observable<StagingAirportTimezoneModel> {
    return of(new StagingAirportTimezoneModel());
  }

  public loadInitialAirportTimeZoneData(): Observable<StagingAirportTimezoneModel[]> {
    this.stagingAirportTimeZones = [ new StagingAirportTimezoneModel(), new StagingAirportTimezoneModel() ];
    return of(this.stagingAirportTimeZones);
  }

  public getLocations(): Observable<LocationModel[]> {
    return of([ new LocationModel(), new LocationModel() ]);
  }

  public loadLocations(request?: IAPIGridRequest): Observable<LocationModel[]> {
    this.locations = [ new LocationModel(), new LocationModel() ];
    return of(this.locations);
  }

  public loadAllCountries(): Observable<CountryModel[]> {
    this.countries = [ new CountryModel(), new CountryModel() ];
    return of(this.countries);
  }

  public upsertTimeZone(timeZone: TimeZoneModel): Observable<TimeZoneModel> {
    return of(new TimeZoneModel({ timeZoneId: 0 }));
  }

  public loadAllAirports(): void {
    this.airports = [ new AirportModel(), new AirportModel() ];
  }

  public loadAirportTimezones(airportId: number): void {
    this.airportTimeZones = [ new TimeZoneModel(), new TimeZoneModel() ];
  }

  public auditHistory(timezoneId: number): Observable<TimeZoneModel[]> {
    this.timeZonesAuditHistory = [ new TimeZoneModel(), new TimeZoneModel() ];
    return of(this.timeZonesAuditHistory);
  }

  public loadTimeZones(isStagingTimeZones: boolean): Observable<TimeZoneModel[]> {
    return of([ new TimeZoneModel(), new TimeZoneModel() ]);
  }

  public getSuppliers(request?: IAPIGridRequest): Observable<IAPIPageResponse<SupplierModel>> {
    return of({
      pageNumber: 1,
      pageSize: 10,
      totalNumberOfRecords: 2,
      results: [ new SupplierModel(), new SupplierModel() ],
    });
  }
}
