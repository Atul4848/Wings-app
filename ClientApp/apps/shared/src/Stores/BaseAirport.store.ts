import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseStore } from './Base.store';
import { IAPIAirport } from '../Interfaces';
import { HttpClient } from '../Tools';
import { NO_SQL_COLLECTIONS } from '../Enums';
import { AirportModel } from '../Models';
import { observable } from 'mobx';
import { apiUrls } from './ApiUrls';
import { baseApiPath } from '../API';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities, tapWithAction } from '@wings-shared/core';

export class BaseAirportStore extends BaseStore {
  private readonly airportFields = [
    'AirportId',
    'ICAOCode',
    'UWACode',
    'FAACode',
    'RegionalCode',
    'IATACode',
    'DisplayCode',
    'Name',
    'CappsAirportName',
    'Status',
  ];
  @observable public wingsAirports: AirportModel[] = [];

  /* istanbul ignore next */
  public getWingsAirports(request?: IAPIGridRequest): Observable<IAPIPageResponse<AirportModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.Airports,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIAirport>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        return { ...response, results: AirportModel.deserializeList(response.results) };
      }),
      tapWithAction(response => (this.wingsAirports = response.results))
    );
  }

  public searchWingsAirports(searchValue: string, excludeRetail?: boolean): Observable<AirportModel[]> {
    if (!searchValue) {
      this.wingsAirports = [];
      return of([]);
    }
    const filter = Utilities.getFilter('Status.Name', 'Active', 'and');
    const request: IAPIGridRequest = {
      pageSize: 50,
      searchCollection: JSON.stringify([
        Utilities.getFilter('DisplayCode', searchValue),
        Utilities.getFilter('Name', searchValue, 'or'),
      ]),
      filterCollection: JSON.stringify(
        excludeRetail
          ? [{ propertyName: 'AppliedAirportUsageType.AirportUsageType.Name', propertyValue: 'Operational' }, filter ]
          : [ filter ]
      ),
      specifiedFields: this.airportFields,
    };
    return this.getWingsAirports(request).pipe(
      map(response => response.results),
      tapWithAction(airports => (this.wingsAirports = airports))
    );
  }

  // Search Airport By Code
  public searchWingsAirportsByCode(
    searchValue: string,
    options?: { excludeRetail?: boolean; includeInactive?: boolean }
  ): Observable<AirportModel[]> {
    if (!searchValue) {
      this.wingsAirports = [];
      return of([]);
    }
    const inactiveFilter = options.includeInactive ? [] : Utilities.getFilter('Status.Name', 'Active', 'and');
    const retailFilter = Utilities.getFilter('AppliedAirportUsageType.AirportUsageType.Name', 'Operational');
    const request: IAPIGridRequest = {
      pageSize: 50,
      searchCollection: JSON.stringify([ Utilities.getFilter('DisplayCode', searchValue) ]),
      filterCollection: JSON.stringify(options?.excludeRetail ? [ retailFilter ].concat(inactiveFilter) : []),
      specifiedFields: this.airportFields,
    };
    return this.getWingsAirports(request).pipe(
      map(response => response.results),
      tapWithAction(airports => (this.wingsAirports = airports))
    );
  }
}
