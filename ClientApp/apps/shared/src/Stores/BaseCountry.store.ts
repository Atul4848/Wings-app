import { from, Observable, of } from 'rxjs';
import { camelCase } from 'change-case';
import { map, tap } from 'rxjs/operators';
import { BaseStore } from './Base.store';
import { CityModel, CountryModel, IslandModel, StateModel, FIRModel, RegionModel, MetroModel } from '../Models';
import { getGqlQuery, HttpClient } from '../Tools';
import { IAPICity, IAPICountry, IAPIIsland, IAPIFIR, IAPIRegion, IAPIMetro, IAPIState } from '../Interfaces';
import { observable } from 'mobx';
import { AlertStore } from '@uvgo-shared/alert';
import { NO_SQL_COLLECTIONS } from '../Enums';
import { apiUrls } from './ApiUrls';
import { baseApiPath } from '../API';
import { Logger } from '@wings-shared/security';
import {
  IAPIGridRequest,
  IAPIPageResponse,
  SEARCH_ENTITY_TYPE,
  Utilities,
  shouldNotNullFilter,
  tapWithAction,
} from '@wings-shared/core';
import { gqlItems } from './GqlItems';

export class BaseCountryStore extends BaseStore {
  @observable public countries: CountryModel[] = [];
  @observable public states: StateModel[] = [];
  @observable public cities: CityModel[] = [];
  @observable public islands: IslandModel[] = [];
  @observable public firs: FIRModel[] = [];
  @observable public regions: RegionModel[] = [];
  @observable public metros: MetroModel[] = [];

  /* istanbul ignore next */
  public searchCountries(searchValue: string): Observable<CountryModel[]> {
    if (!searchValue) {
      this.countries = [];
      return of([]);
    }
    const request = Utilities.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.COUNTRY);
    return this.getCountries(request).pipe(map(x => x.results));
  }

  /* istanbul ignore next */
  public searchCities(
    params: { searchValue: string; countryId?: number; stateId?: number },
    excludeCappsFilter: boolean,
    excludeInActive: boolean
  ): Observable<CityModel[]> {
    if (!params.searchValue) {
      this.cities = [];
      return of([]);
    }
    const filters = params.stateId
      ? Utilities.getFilter('State.StateId', params.stateId)
      : Utilities.getFilter('Country.CountryId', params.countryId);
    const filterActive = Utilities.getFilter('Status.Name', 'Active');
    const filterCollection = excludeCappsFilter ? [ filters ] : [ filters, shouldNotNullFilter('CAPPSCode') ];
    const finalFilters = filterCollection[0] !== null ? filterCollection : [];
    const request = Utilities.getSearchRequest(
      params.searchValue,
      SEARCH_ENTITY_TYPE.CITY,
      excludeInActive ? finalFilters.concat(filterActive) : finalFilters
    );
    return this.getCities(request).pipe(map(x => x.results));
  }

  /* istanbul ignore next */
  public searchStates(params: { searchValue: string; countryId?: number }): Observable<StateModel[]> {
    if (!params.searchValue) {
      this.states = [];
      return of([]);
    }
    const filters = Utilities.getFilter('Country.CountryId', params.countryId);
    const request = Utilities.getSearchRequest(params.searchValue, SEARCH_ENTITY_TYPE.STATE, [
      ...(filters ? [ filters ] : []),
      shouldNotNullFilter('CappsCode'),
    ]);
    return this.getStates(request).pipe(map(x => x.results));
  }

  /* istanbul ignore next */
  public searchRegions(searchValue: string): Observable<RegionModel[]> {
    if (!searchValue) {
      return of([]);
    }
    const request = Utilities.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.REGION);
    return this.getRegions(request).pipe(map(x => x.results));
  }

  /* istanbul ignore next */
  public searchFirs(searchValue: string): Observable<FIRModel[]> {
    if (!searchValue) {
      return of([]);
    }
    const request = Utilities.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.FIR);
    return this.getFIRs(request).pipe(map(x => x.results));
  }

  /* istanbul ignore next */
  public getCountries(request?: IAPIGridRequest): Observable<IAPIPageResponse<CountryModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.COUNTRY,
      sortCollection: JSON.stringify([{ propertyName: 'CommonName', isAscending: true }]),
      ...request,
    });

    return from(
      http.post<any>('/graphql', { query: getGqlQuery(params, gqlItems.country) })
    ).pipe(
      map(resp => {
        const collection = resp.data[camelCase('country')];
        return {
          pageNumber: request?.pageNumber || 1,
          pageSize: request?.pageSize,
          totalNumberOfRecords: collection?.totalCount,
          results: CountryModel.deserializeList(collection?.items) || [],
        };
      }),
      tapWithAction(response => (this.countries = response.results))
    );
  }

  /* istanbul ignore next */
  public getStates(request?: IAPIGridRequest): Observable<IAPIPageResponse<StateModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.STATE,
      sortCollection: JSON.stringify([{ propertyName: 'CommonName', isAscending: true }]),
      ...request,
    });

    return from(
      http.post<any>('/graphql', { query: getGqlQuery(params, gqlItems.state) })
    ).pipe(
      map(resp => {
        const collection = resp.data[camelCase('state')];
        return {
          pageNumber: request.pageNumber,
          pageSize: request.pageSize,
          totalNumberOfRecords: collection?.totalCount,
          results: StateModel.deserializeList(collection?.items) || [],
        };
      }),
      tapWithAction(response => (this.states = response.results))
    );
  }

  /* istanbul ignore next */
  public getCities(request?: IAPIGridRequest): Observable<IAPIPageResponse<CityModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.CITY,
      sortCollection: JSON.stringify([{ propertyName: 'CommonName', isAscending: true }]),
      ...request,
    });
    return from(
      http.post<any>('/graphql', { query: getGqlQuery(params, gqlItems.city) })
    ).pipe(
      map(resp => {
        const collection = resp.data[camelCase('city')];
        return {
          pageNumber: request.pageNumber,
          pageSize: request.pageSize,
          totalNumberOfRecords: collection?.totalCount,
          results: CityModel.deserializeList(collection?.items) || [],
        };
      }),
      tapWithAction(response => (this.cities = response.results))
    );
  }

  /* istanbul ignore next */
  public getIslands(request?: IAPIGridRequest): Observable<IAPIPageResponse<IslandModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.ISLAND,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
      ...request,
    });
    return from(
      http.post<any>('/graphql', { query: getGqlQuery(params, gqlItems.island) })
    ).pipe(
      map(resp => {
        const collection = resp.data[camelCase('island')];
        return {
          pageNumber: request.pageNumber,
          pageSize: request.pageSize,
          totalNumberOfRecords: collection?.totalCount,
          results: IslandModel.deserializeList(collection?.items) || [],
        };
      }),
      tapWithAction(response => (this.islands = response.results))
    );
  }

  /* istanbul ignore next */
  public getFIRs(request?: IAPIGridRequest): Observable<IAPIPageResponse<FIRModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.FIR,
      specifiedFields: [ 'FIRId', 'Name', 'Code' ],
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIFIR>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: FIRModel.deserializeList(response.results) })),
      tapWithAction(response => (this.firs = response.results))
    );
  }

  /* istanbul ignore next */
  public getRegions(request?: IAPIGridRequest): Observable<IAPIPageResponse<RegionModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.REGION,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
      ...request,
    });

    return http.get<IAPIPageResponse<IAPIRegion>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: RegionModel.deserializeList(response.results) })),
      tapWithAction(response => (this.regions = response.results))
    );
  }

  /* istanbul ignore next */
  public removeCity({ id }: CityModel): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    return http
      .delete<string>(apiUrls.city, { cityId: id })
      .pipe(
        Logger.observableCatchError,
        tap(() => AlertStore.info('City deleted successfully!'))
      );
  }

  /* istanbul ignore next */
  public getMetros(request?: IAPIGridRequest): Observable<MetroModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIMetro>>(`${apiUrls.metro}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => MetroModel.deserializeList(response.results)),
      tapWithAction(response => (this.metros = response))
    );
  }
}
