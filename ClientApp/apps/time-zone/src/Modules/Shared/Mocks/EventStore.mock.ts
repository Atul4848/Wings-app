import { EventStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { EventFrequencyModel, EventModel, ExportedEventsErrorModel, ImportWorldEventModel } from '../Models';
import { CityModel, RegionModel, StateModel, CountryModel } from '@wings/shared';
import { IAPIGridRequest, IAPIPageResponse, SettingsTypeModel } from '@wings-shared/core';

export class EventStoreMock extends EventStore {
  public getCountries(request?: IAPIGridRequest): Observable<IAPIPageResponse<CountryModel>> {
    const results: CountryModel[] = [ new CountryModel(), new CountryModel() ];
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results });
  }

  public getStates(request?: IAPIGridRequest): Observable<IAPIPageResponse<StateModel>> {
    const results: StateModel[] = [ new StateModel(), new StateModel() ];
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results });
  }

  public getEvents(request?: IAPIGridRequest): Observable<IAPIPageResponse<EventModel>> {
    const results: EventModel[] = [ new EventModel(), new EventModel() ];
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results });
  }

  public getExportedEvents(request?: IAPIGridRequest): Observable<IAPIPageResponse<ImportWorldEventModel>> {
    const results: ImportWorldEventModel[] = [ new ImportWorldEventModel(), new ImportWorldEventModel() ];
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results });
  }

  public getExportedEventsErrors(runId?: string): Observable<ExportedEventsErrorModel[]> {
    return of([ new ExportedEventsErrorModel(), new ExportedEventsErrorModel() ]);
  }

  public getRegions(request?: IAPIGridRequest): Observable<IAPIPageResponse<RegionModel>> {
    const results: RegionModel[] = [ new RegionModel(), new RegionModel() ];
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results });
  }

  public getCities(request?: IAPIGridRequest): Observable<IAPIPageResponse<CityModel>> {
    const results: CityModel[] = [ new CityModel(), new CityModel() ];
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results });
  }

  public getWorldEventCategory(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]);
  }

  public getWorldEventFrequency(): Observable<EventFrequencyModel[]> {
    return of([ new EventFrequencyModel(), new EventFrequencyModel() ]);
  }

  public getCitiesByCountries(countryIds: number[], states?: StateModel[]): Observable<CityModel[]> {
    return of([ new CityModel(), new CityModel() ]);
  }

  public upsertEvent(event: EventModel): Observable<EventModel> {
    return of(new EventModel());
  }

  public removeEvent(worldEventId: number): Observable<string> {
    return of('');
  }

  public loadEventById(id: number): Observable<EventModel> {
    return of(new EventModel());
  }
}
