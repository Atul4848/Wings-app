import {
  HttpClient,
  BaseStore,
  baseApiPath,
  AirportModel,
  BaseAirportStore,
} from '@wings/shared';
import { observable, action } from 'mobx';
import { map, tap, takeUntil } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { AirportLocationModel, CountryModel, TimeZoneModel } from '../Models';
import { IAPITimeZone, IAPIAirportLocation } from '../Interfaces';
import { FilterRequestModel } from '../../AirportTimeZones/Shared';
import moment, { Moment } from 'moment';
import { AlertStore } from '@uvgo-shared/alert';
import { apiUrls } from './API.url';
import { Logger } from '@wings-shared/security';
import {
  Utilities,
  DATE_FORMAT,
  IAPIGridRequest,
  IAPIPageResponse,
  tapWithAction,
  EntityMapModel,
} from '@wings-shared/core';

export class TimeZoneDetailStore extends BaseStore {
  private readonly baseAirportStore = new BaseAirportStore();
  @observable public timeZones: TimeZoneModel[] = [];
  @observable public filteredTimeZones: TimeZoneModel[] = [];
  @observable public chipData: FilterRequestModel[] = [];
  @observable public chipInput: FilterRequestModel;
  @observable public countries: CountryModel[] = [];
  @observable public wingsAirports: AirportModel[] = [];
  @observable public airportLocation: EntityMapModel[] = [];

  @action
  public setFilteredTimeZones(): void {
    const timeZones = [ ...this.timeZones ].sort((prev: TimeZoneModel, curr: TimeZoneModel) => {
      if (curr.year < prev.year) return 1;
      if (curr.year > prev.year) return -1;
      return moment(prev.oldLocalTime).valueOf() - moment(curr.oldLocalTime).valueOf();
    });

    this.filteredTimeZones = timeZones.map((currentTimeZone: TimeZoneModel, index: number) => {
      if (index < timeZones.length - 1) {
        const nextTimeZone: TimeZoneModel = timeZones[index + 1];
        const currentZoneOffset: number = currentTimeZone?.zoneTotalOffset;
        const nextZoneOffset: number = nextTimeZone?.zoneTotalOffset;
        const timeChangeInHours: number = (nextZoneOffset - currentZoneOffset) / 3600;

        currentTimeZone.timeChange = `${timeChangeInHours} hour${
          timeChangeInHours > 1 || timeChangeInHours < -1 ? 's' : ''
        } (DST ${currentTimeZone.zoneDst ? 'start' : 'end'})`;

        return currentTimeZone;
      }
      currentTimeZone.timeChange = 'No time change yet';
      return currentTimeZone;
    });
  }

  public setAirportTimeZones(airportTimeZones: AirportLocationModel[]): AirportLocationModel[] {
    if (!Array.isArray(airportTimeZones)) {
      return [];
    }

    const selectedDate: Moment = moment(moment().format(DATE_FORMAT.API_FORMAT));
    const utcTime = moment(selectedDate).utc();

    return airportTimeZones.map(timezone => {
      timezone.localTime = moment(utcTime)
        .add(timezone.zoneTotalOffsetInSeconds, 'seconds')
        .format(DATE_FORMAT.GRID_DISPLAY);

      timezone.zuluTime = `${moment(timezone.localTime)
        .subtract(timezone.zoneTotalOffsetInSeconds, 'seconds')
        .format(DATE_FORMAT.GRID_DISPLAY)}Z`;

      return timezone;
    });
  }
  /* istanbul ignore next */
  public getAirportTimeZones(request?: IAPIGridRequest): Observable<IAPIPageResponse<AirportLocationModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const params: string = Utilities.buildParamString(request || { pageSize: 0 });

    return http.get<IAPIPageResponse<IAPIAirportLocation>>(`${apiUrls.airportLocations}?${params}`).pipe(
      map(response => {
        const modifiedResults = AirportLocationModel.deserializeList(response.results);
        this.setAirportTimeZones(modifiedResults);
        const modifiedResponse: IAPIPageResponse<AirportLocationModel> = {
          ...response,
          results: modifiedResults,
        };
        return modifiedResponse;
      })
    );
  }

  /* istanbul ignore next */
  public searchWingsAirports(searchValue: string): Observable<AirportModel[]> {
    if (!searchValue) {
      this.wingsAirports = [];
      return of([]);
    }
    const request: IAPIGridRequest = {
      pageSize: 50,
      filterCollection: JSON.stringify([ Utilities.getFilter('Status.Name', 'Active', 'and') ]),
      searchCollection: JSON.stringify([
        Utilities.getFilter('DisplayCode', searchValue),
        Utilities.getFilter('Name', searchValue, 'or'),
      ]),
      specifiedFields: [
        'DisplayCode',
        'AirportId',
        'ICAOCode',
        'UWACode',
        'IATACode',
        'Name',
        'LatitudeCoordinate',
        'LongitudeCoordinate',
      ],
    };
    return this.baseAirportStore.getWingsAirports(request).pipe(
      map(response => response.results),
      tapWithAction(airports => (this.wingsAirports = airports))
    );
  }

  /* istanbul ignore next */
  public getAirportLocation(request?: IAPIGridRequest): Observable<AirportLocationModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const params: string = Utilities.buildParamString(request || { pageSize: 0 });

    return http.get<IAPIPageResponse<IAPIAirportLocation>>(`${apiUrls.airportLocations}?${params}`).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      map(response => AirportLocationModel.deserializeList(response.results)),
      tap(airportLocations => {
        this.airportLocation = airportLocations.map(x =>
          EntityMapModel.deserialize({ ...x, id: x.id, name: x.name, code: x.airportCode, entityId: x.id })
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadAirportTimeZones(airportId: number): Observable<TimeZoneModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });

    return http.get<IAPITimeZone[]>(`${apiUrls.airportTimezones(airportId)}`).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      map(response => TimeZoneModel.deserializeList(response)),
      tap((mappedTimeZones: TimeZoneModel[]) => {
        this.timeZones = mappedTimeZones;
        this.setFilteredTimeZones();
      })
    );
  }

  /* istanbul ignore next */
  public upsertAirportTimezone(requestData: Partial<IAPIAirportLocation>): Observable<AirportLocationModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const isNewRequest: boolean = requestData.id === 0;
    const upsertRequest: Observable<IAPIAirportLocation> = isNewRequest
      ? http.post<IAPIAirportLocation>(apiUrls.addAirportTimezone, requestData)
      : http.put<IAPIAirportLocation>(apiUrls.updateAirportTimezone(requestData.id), requestData);

    return upsertRequest.pipe(
      map((response: IAPIAirportLocation) => AirportLocationModel.deserialize(response)),
      tap(() => AlertStore.info(`Airport Time Zone ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public updateTimezoneRegion(requestData: Partial<IAPIAirportLocation>): Observable<AirportLocationModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const upsertRequest: Observable<IAPIAirportLocation> = http.put<IAPIAirportLocation>(
      apiUrls.updateTimezoneRegion(requestData.id),
      {
        airportId: requestData.id,
        timezoneRegionId: requestData.timezoneRegionId,
      }
    );

    return upsertRequest.pipe(
      map((response: IAPIAirportLocation) => AirportLocationModel.deserialize(response)),
      tap(() => AlertStore.info('Time Zone Region updated successfully!'))
    );
  }

}
