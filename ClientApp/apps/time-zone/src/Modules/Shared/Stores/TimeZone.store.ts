import { HttpClient, BaseStore, baseApiPath, NO_SQL_COLLECTIONS } from '@wings/shared';
import { IAPIGridRequest, IAPIPageResponse, TimeZoneBaseModel, UIStore, Utilities } from '@wings-shared/core';
import {
  LocationModel,
  CountryModel,
  AirportModel,
  StagingAirportTimezoneModel,
  StagingTimeZoneModel,
  TimeZoneRegionModel,
  SupplierModel,
  HotelModel,
  SupplierAirportModel,
} from '../Models';
import { forkJoin, Observable } from 'rxjs';
import { tap, finalize, takeUntil, map } from 'rxjs/operators';
import { observable } from 'mobx';
import { AxiosError } from 'axios';
import {
  IAPILocation,
  IAPITimeZone,
  IAPIAirport,
  IAPIStagingAirportRegion,
  IAPIStagingTimeZone,
  IAPITimeZoneRegion,
  IAPISupplier,
  IAPISupplierRequest,
  IAPIHotel,
  IAPIHotelRequest,
  IAPISupplierAirportRequest,
  IAPISupplierAirport,
} from '../Interfaces';
import { TimeZoneModel } from './../Models';
import moment, { Moment } from 'moment';
import { AlertStore } from '@uvgo-shared/alert';
import { apiUrls } from './API.url';
import { Logger } from '@wings-shared/security';

export class TimeZoneStore extends BaseStore {
  @observable public locations: LocationModel[] = [];
  @observable public timeZones: TimeZoneModel[] = [];
  @observable public countries: CountryModel[] = [];
  @observable public airports: AirportModel[] = [];
  @observable public airportTimeZones: TimeZoneModel[] = [];
  @observable public stagingAirportTimeZones: StagingAirportTimezoneModel[] = [];
  @observable public timeZonesAuditHistory: TimeZoneModel[] = [];
  @observable public stagingTimeZones: StagingTimeZoneModel[] = [];
  @observable public timeZoneRegions: TimeZoneRegionModel[] = [];
  @observable public suppliers: SupplierModel[] = [];
  @observable public hotels: HotelModel[] = [];

  /* istanbul ignore next */
  public loadInitialTimeZoneData(isStagingTimeZones: boolean = false): Observable<TimeZoneModel[]> {
    return this.loadTimeZones(isStagingTimeZones).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      tap((timeZones: TimeZoneModel[]) => (this.timeZones = timeZones))
    );
  }

  /* istanbul ignore next */
  public loadStagingTimeZones(): Observable<StagingTimeZoneModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const params: string = Utilities.buildParamString({ pageSize: 0 });

    return http.get<IAPIPageResponse<IAPIStagingTimeZone>>(`${apiUrls.stagingTimezone}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => StagingTimeZoneModel.deserializeList(response.results)),
      tap(stagingTimeZones => (this.stagingTimeZones = stagingTimeZones))
    );
  }

  /* istanbul ignore next */
  public loadStagingAirportTimeZones(): Observable<StagingAirportTimezoneModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const params: string = Utilities.buildParamString({ pageSize: 0 });

    return http.get<IAPIPageResponse<IAPIStagingAirportRegion>>(`${apiUrls.stagingAirportRegion}?${params}`).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      map(response => StagingAirportTimezoneModel.deserializeList(response.results)),
      tap(stagingAirportTimeZones => (this.stagingAirportTimeZones = stagingAirportTimeZones))
    );
  }

  /* istanbul ignore next */
  public updateStagingTimezoneRegion(
    requestData: Partial<IAPIStagingAirportRegion>
  ): Observable<StagingAirportTimezoneModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const upsertRequest: Observable<IAPIStagingAirportRegion> = http.put<IAPIStagingAirportRegion>(
      apiUrls.updateStagingTimezoneRegion(requestData.airportId),
      requestData
    );

    return upsertRequest.pipe(
      map(response => StagingAirportTimezoneModel.deserialize(response)),
      tap(() => AlertStore.info('Time Zone Region updated successfully!'))
    );
  }

  /* istanbul ignore next */
  public getTimeZonesForLocation(locationId: number): Observable<TimeZoneModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const params: string = Utilities.buildParamString({ pageSize: 0 });
    return http
      .get<IAPIPageResponse<IAPITimeZone>>(`${apiUrls.timeZonesForLocation(locationId)}?${params}`)
      .pipe(map(response => TimeZoneModel.deserializeList(response.results)));
  }

  /* istanbul ignore next */
  public getLocations(): Observable<LocationModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const params: string = Utilities.buildParamString({ pageSize: 0 });
    return http.get<IAPIPageResponse<IAPILocation>>(`${apiUrls.locations}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => LocationModel.deserializeList(response.results))
    );
  }

  /* istanbul ignore next */
  protected getLocationsWithTimeZones(): Observable<LocationModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const params: string = Utilities.buildParamString({ pageSize: 0 });
    return http.get<IAPIPageResponse<IAPILocation>>(`${apiUrls.timeZone}/${0}/locations?${params}`).pipe(
      Logger.observableCatchError,
      map(response => LocationModel.deserializeList(response.results))
    );
  }

  /* istanbul ignore next */
  protected getTimeZones(isStagingTimeZones: boolean, request?: IAPIGridRequest): Observable<TimeZoneModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      ...request,
    });
    const stagingTimeZoneParams: string = Utilities.buildParamString({ PageSize: 0 });

    const apiUrl = isStagingTimeZones
      ? `${apiUrls.stagingTimezone}?${stagingTimeZoneParams}`
      : `${apiUrls.timeZone}?${params}`;

    return http.get<IAPIPageResponse<IAPITimeZone>>(apiUrl).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: TimeZoneModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public deleteTimeZone(id: number): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    return http.delete(`${apiUrls.timeZone}`, [ id ]).pipe(
      Logger.observableCatchError,
      map(response => response.message),
      tap(() => AlertStore.info('TimeZone deleted successfully!'))
    );
  }

  /* istanbul ignore next */
  public loadTimeZones(isStagingTimeZones: boolean): Observable<TimeZoneModel[]> {
    return forkJoin([
      this.getLocations(),
      this.getLocationsWithTimeZones(),
      this.getTimeZones(isStagingTimeZones),
    ]).pipe(
      map(([ allLocations, locationsWithTimeZones, timeZones ]) => {
        const mappedTimeZones = timeZones.map(timeZone => {
          const locations = locationsWithTimeZones
            .filter(location => location.timeZoneId === timeZone.timeZoneId)
            .map(location => location.locationId);

          timeZone.locations = allLocations.filter(location => locations.includes(location.locationId));
          return timeZone;
        });
        return mappedTimeZones;
      })
    );
  }

  /* istanbul ignore next */
  public loadLocations(request?: IAPIGridRequest): Observable<LocationModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const params: string = Utilities.buildParamString({ ...request, pageSize: 0 });
    return http.get<IAPIPageResponse<IAPILocation>>(`${apiUrls.locations}?${params}`).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      map(response =>
        Utilities.customArraySort<LocationModel>(LocationModel.deserializeList(response.results), 'regionName', 'name')
      ),
      tap(locations => (this.locations = locations))
    );
  }

  /* istanbul ignore next */
  public loadTimeZoneRegion(request?: IAPIGridRequest): Observable<TimeZoneRegionModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const params: string = Utilities.buildParamString(request || { pageSize: 0 });

    return http.get<IAPIPageResponse<IAPITimeZoneRegion>>(`${apiUrls.timeZoneRegion}?${params}`).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      map(response => TimeZoneRegionModel.deserializeList(response.results)),
      tap(regions => (this.timeZoneRegions = regions))
    );
  }

  /* istanbul ignore next */
  public upsertTimeZone(timeZone: TimeZoneModel): Observable<TimeZoneModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });

    const isNewRequest: boolean = timeZone.timeZoneId === 0;
    const upsertRequest: Observable<IAPITimeZone> = isNewRequest
      ? http.post<IAPITimeZone>(apiUrls.timeZone, [ timeZone ])
      : http.put<IAPITimeZone>(apiUrls.timeZone, [ timeZone ]);

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPITimeZone) => TimeZoneModel.deserialize(response[0])),
      tap(() => AlertStore.info(`Time Zone ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public loadAllAirports(): void {
    UIStore.setPageLoader(true);
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const params: string = Utilities.buildParamString({ pageSize: 0 });
    http
      .get<IAPIPageResponse<IAPIAirport>>(`${apiUrls.airports}?${params}`)
      .pipe(
        takeUntil(this.reset$),
        map(response =>
          Utilities.customArraySort<AirportModel>(AirportModel.deserializeList(response.results), 'officialICAOCode')
        )
      )
      .subscribe({
        next: airports => (this.airports = airports),
        error: (error: AxiosError) => Logger.error(error.message),
        complete: () => UIStore.setPageLoader(false),
      });
  }

  /* istanbul ignore next */
  public loadAirportTimezones(airportId: number): void {
    UIStore.setPageLoader(true);
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    http
      .get<IAPITimeZone[]>(`${apiUrls.airportTimezones(airportId)}`)
      .pipe(
        takeUntil(this.reset$),
        map(response => Utilities.customArraySort<TimeZoneModel>(TimeZoneModel.deserializeList(response), 'timeZoneId'))
      )
      .subscribe({
        next: timeZones => (this.airportTimeZones = timeZones),
        error: (error: AxiosError) => Logger.error(error.message),
        complete: () => UIStore.setPageLoader(false),
      });
  }

  public convertTime(conversionDate: string): { localTime: moment.Moment; zuluTime: moment.Moment } {
    // TODO: Check usages of this method is receives few formats
    // 2020-10-26T12:43:35 and sometimes it's receive 2020-10-27T18:44:00.000Z
    const selectedDate: Moment = moment(conversionDate, [ moment.ISO_8601, moment.HTML5_FMT.DATETIME_LOCAL ]);
    const selectedTimeZone: TimeZoneBaseModel = Utilities.getCurrentTimeZone(this.airportTimeZones, selectedDate);
    if (!selectedTimeZone) {
      AlertStore.info('No time zone available for selected date!');
      return null;
    }
    const localTime: Moment = moment(selectedDate).add(selectedTimeZone.zoneTotalOffset, 'seconds');
    const zuluTime: Moment = moment(selectedDate).subtract(selectedTimeZone.zoneTotalOffset, 'seconds');
    return { localTime, zuluTime };
  }

  /* istanbul ignore next */
  public auditHistory(timezoneId: number): Observable<TimeZoneModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });

    return http.get<IAPIPageResponse<IAPITimeZone>>(apiUrls.auditHistory(timezoneId)).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      map(response =>
        Utilities.customArraySort<TimeZoneModel>(TimeZoneModel.deserializeList(response.results), 'timeZoneId')
      ),
      tap(timeZones => (this.timeZonesAuditHistory = timeZones)),
      finalize(() => UIStore.setPageLoader(false))
    );
  }

  /* istanbul ignore next */
  public getSuppliers(request?: IAPIGridRequest): Observable<IAPIPageResponse<SupplierModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.SUPPLIER,
      sortCollection: JSON.stringify([{ propertyName: 'SupplierType.Name', isAscending: true }]),
      ...request,
    });

    return http.get<IAPIPageResponse<IAPISupplier>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      map(response => ({ ...response, results: SupplierModel.deserializeList(response.results) })),
      tap(suppliers => (this.suppliers = suppliers))
    );
  }

  /* istanbul ignore next */
  public upsertSupplier(supplier: IAPISupplierRequest): Observable<SupplierModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const isNewRequest: boolean = supplier.id === 0;
    const upsertRequest: Observable<IAPISupplierRequest> = isNewRequest
      ? http.post<IAPISupplierRequest>(apiUrls.supplier, supplier)
      : http.put<IAPISupplierRequest>(`${apiUrls.supplier}/${supplier.id}`, supplier);

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => SupplierModel.deserialize(response)),
      tap(() => AlertStore.info(`Supplier ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public upsertSupplierAirport(supplier): Observable<SupplierAirportModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const isNewRequest: boolean = supplier.id === 0;
    const upsertRequest: Observable<IAPISupplierAirport> = isNewRequest
      ? http.post<IAPISupplierAirport>(`${apiUrls.supplierAirport}/${supplier.supplierId}/airport`, supplier)
      : http.put<IAPISupplierAirport>(
        `${apiUrls.supplierAirport}/${supplier.supplierId}/airport/${supplier.id}`,
        supplier
      );

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => SupplierAirportModel.deserialize(response)),
      tap(() => AlertStore.info(`Supplier ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  public getSupplierAirport(supplier): Observable<IAPIPageResponse<SupplierAirportModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    return http.get<IAPIPageResponse<IAPISupplierAirport>>(`${apiUrls.supplierAirport}/${supplier}/airport`).pipe(
      Logger.observableCatchError,
      map(response => ({
        ...response,
        results: SupplierAirportModel.deserializeList(response.results)
      }))
    );
  }

  /* istanbul ignore next */
  public getHotelsNosql(request?: IAPIGridRequest): Observable<IAPIPageResponse<HotelModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.HOTEL,
      ...request,
    });

    return http.get<IAPIPageResponse<IAPIHotel>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      map(response => ({ ...response, results: HotelModel.deserializeList(response.results) })),
      tap(hotels => (this.hotels = hotels))
    );
  }

  /* istanbul ignore next */
  public getHotels(request?: IAPIGridRequest): Observable<HotelModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      ...request,
    });

    return http.get<IAPIPageResponse<IAPIHotel[]>>(`${apiUrls.hotel}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => HotelModel.deserializeList(response.results))
    );
  }

  /* istanbul ignore next */
  public getHotelById(hotelId: number): Observable<HotelModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    return http.get<IAPIHotel>(`${apiUrls.hotel}/${hotelId}`).pipe(map(response => HotelModel.deserialize(response)));
  }

  /* istanbul ignore next */
  public upsertHotel(hotel: IAPIHotelRequest): Observable<HotelModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const isNewRequest: boolean = hotel.id === 0;
    if(!hotel.sourceTypeId) delete hotel.sourceTypeId;
    const upsertRequest: Observable<IAPIHotelRequest> = isNewRequest
      ? http.post<IAPIHotelRequest>(apiUrls.hotel, hotel)
      : http.put<IAPIHotelRequest>(`${apiUrls.hotel}/${hotel.id}`, hotel);

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => HotelModel.deserialize(response)),
      tap(() => AlertStore.info(`Hotel ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }
}
