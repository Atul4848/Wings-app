import { HttpClient, NO_SQL_COLLECTIONS, baseApiPath } from '@wings/shared';
import { observable, action } from 'mobx';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';
import { refDataHeaders, vendorManagementHeaders } from './Base.store';
import { IAPIVMSComparison } from '../Modules/Shared/Interfaces';
import { apiUrls } from './API.url';
import { VendorLocationModel } from '../Modules/Shared';
import { LocationHoursModel } from '../Modules/Shared/Models/LocationHours.model';

export class VendorLocationHoursStore {
  @observable public locationHoursList: LocationHoursModel[] = [];
  @observable public airportHoursList: LocationHoursModel[] = [];
  @observable public quarantineAirportHoursList: LocationHoursModel[] = [];
  @observable public updatedHoursData: LocationHoursModel[] = [];
  @observable public timeDataHoursData: LocationHoursModel[] = [];
  @observable public overTimeHoursData: LocationHoursModel[] = [];

  @action
  public getVendorLocationHours(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<VendorLocationModel>> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: 'VendorLocation',
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIVMSComparison>>(`${apiUrls.vendorManagement}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        this.locationHoursList = LocationHoursModel.deserializeList(response.results[0]?.vendorLocationHours);
        this.locationHoursList = this.locationHoursList.filter(item => item.hoursScheduleType.id === 1);
        return { ...response, results: this.locationHoursList };
      })
    );
  }

  @action
  public getAirportHours(
    pageRequest?: IAPIGridRequest,
    isQuarantine?: boolean
  ): Observable<IAPIPageResponse<LocationHoursModel>> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: 'AirportHoursReference',
      ...pageRequest,
    });
    return http.get<IAPIPageResponse<IAPIVMSComparison>>(`${apiUrls.vendorManagement}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        if (isQuarantine) {
          this.quarantineAirportHoursList = LocationHoursModel.deserializeList(response.results);
          return { ...response, results: this.quarantineAirportHoursList };
        } else {
          this.airportHoursList = LocationHoursModel.deserializeList(response.results);
          return { ...response, results: this.airportHoursList };
        }
      })
    );
  }

  @action
  public updateVendorLocationHour(payload: LocationHoursModel[]): Observable<LocationHoursModel[]> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    const upsertRequest: Observable<LocationHoursModel[]> = http.put<any>(
      `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationHours}/UpdateList`,
      payload
    );
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => LocationHoursModel.deserializeList(response))
    );
  }

  @action
  public addVendorLocationHour(payload: LocationHoursModel[]): Observable<LocationHoursModel[]> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    const upsertRequest: Observable<LocationHoursModel[]> = http.post<any>(
      `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationHours}/AddList`,
      payload
    );
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => LocationHoursModel.deserializeList(response))
    );
  }

  @action
  public deleteLocationHours(vendorLocationHoursIds: number[]): Observable<LocationHoursModel[]> {
    const payload = {
      userId: 'string',
      vendorLocationHoursIds,
    };
    const http = new HttpClient({ headers: vendorManagementHeaders });
    const upsertRequest: Observable<LocationHoursModel[]> = http.delete<any>(
      `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationHours}/DeleteList`,
      payload
    );
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => LocationHoursModel.deserializeList(response))
    );
  }
}
