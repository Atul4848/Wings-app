import {
  HttpClient,
  StateModel,
  CityModel,
  IAPICountry,
  CountryModel,
  SovereignCountryModel,
  IAPICity,
  MetroModel,
  IAPIMetro,
  BaseCountryStore,
  IAPIState,
  baseApiPath,
  IslandModel,
  IAPIIsland,
  IAPIContinent,
  IAPISovereignCountry,
  ICountryRequest,
  NO_SQL_COLLECTIONS,
  BaseCityModel,
  getGqlQuery,
  gqlItems,
} from '@wings/shared';
import { apiUrls } from './API.url';
import { AeronauticalInformationPublicationModel, AssociatedAIPModel, ContinentModel } from '../Models';
import { tap, finalize, map } from 'rxjs/operators';
import { action, observable } from 'mobx';
import { AlertStore } from '@uvgo-shared/alert';
import { from, Observable, of } from 'rxjs';
import { IAPIAeronauticalInformationPublication, IAPIAssociatedAIP, IAPIAssociatedAipRequest } from '../Interfaces';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities, tapWithAction } from '@wings-shared/core';

export class CountryStore extends BaseCountryStore {
  @observable public continents: ContinentModel[] = [];
  @observable public islands: IslandModel[] = [];
  @observable public metros: MetroModel[] = [];
  @observable public selectedCountry: CountryModel;
  @observable public capitalCities: BaseCityModel[] = [];

  @action
  public clearStore(): void {
    this.countries = [];
    this.metros = [];
    this.states = [];
    this.cities = [];
    this.capitalCities = [];
  }
  
  @action
  public setSelectedCountry(country: Partial<CountryModel>): void {
    this.selectedCountry = new CountryModel(country);
  }

  @action
  public clearCapitalCity(): void {
    this.capitalCities = [];
  }

  /* istanbul ignore next */
  public upsertState(state: StateModel): Observable<StateModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });

    const isNewRequest: boolean = state.id === 0;
    const upsertRequest: Observable<IAPIState> = isNewRequest
      ? http.post<IAPIState>(apiUrls.state, state.serialize())
      : http.put<IAPIState>(`${apiUrls.state}/${state.id}`, state.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIState) => StateModel.deserialize(response)),
      tap(() => AlertStore.info(`State ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public upsertCountry(country: ICountryRequest): Observable<CountryModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });

    const isNewRequest: boolean = country.id === 0;
    const upsertRequest: Observable<IAPICountry> = isNewRequest
      ? http.post<IAPICountry>(apiUrls.country, country)
      : http.put<IAPICountry>(`${apiUrls.country}/${country.id}`, country);

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPICountry) => CountryModel.deserialize(response)),
      tap(() => AlertStore.info(`Country ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public getContinents(forceRefresh?: boolean): Observable<ContinentModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    const params: string = Utilities.buildParamString({ pageSize: 0 });

    if (this.continents.length && !forceRefresh) {
      return of(this.continents);
    }

    return http.get<IAPIPageResponse<IAPIContinent>>(`${apiUrls.continent}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ContinentModel.deserializeList(response.results)),
      tap(continents => (this.continents = continents))
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

  /* istanbul ignore next */
  public upsertCity(city: CityModel): Observable<CityModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });

    const isNewRequest: boolean = city.id === 0;
    const upsertRequest: Observable<IAPICity> = isNewRequest
      ? http.post<IAPICity>(apiUrls.city, city.serialize())
      : http.put<IAPICity>(`${apiUrls.city}/${city.id}`, city.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPICity) => CityModel.deserialize(response)),
      tap(() => AlertStore.info(`City ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public upsertContinent(continent: ContinentModel): Observable<ContinentModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    this.loader.showLoader();

    const isNewRequest: boolean = continent.id === 0;
    const upsertRequest: Observable<IAPIContinent> = isNewRequest
      ? http.post<IAPIContinent>(apiUrls.continent, continent.serialize())
      : http.put<IAPIContinent>(`${apiUrls.continent}/${continent.id}`, continent.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIContinent) => ContinentModel.deserialize(response)),
      tap(() => AlertStore.info(`Continent ${isNewRequest ? 'created' : 'updated'} successfully!`)),
      finalize(() => this.loader.hideLoader())
    );
  }

  /* istanbul ignore next */
  public getCountryById(countryId: number): Observable<CountryModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    return http
      .get<IAPICountry>(`${apiUrls.country}/${countryId}`)
      .pipe(map(response => CountryModel.deserialize(response)));
  }

  /* istanbul ignore next */
  public getSovereignty(isTerritory: boolean): Observable<SovereignCountryModel[]> {
    const params: string = Utilities.buildParamString({
      pageSize: 0,
      FilterCollection: JSON.stringify([{ isTerritory }]),
    });

    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    return http.get<IAPIPageResponse<IAPISovereignCountry>>(`${apiUrls.country}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => SovereignCountryModel.deserializeList(response.results))
    );
  }

  /* istanbul ignore next */
  public upsertMetro(metro: MetroModel): Observable<MetroModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });

    const isNewRequest: boolean = metro.id === 0;
    const upsertRequest: Observable<IAPIMetro> = isNewRequest
      ? http.post<IAPIMetro>(apiUrls.metro, metro.serialize())
      : http.put<IAPIMetro>(`${apiUrls.metro}/${metro.id}`, metro.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIMetro) => MetroModel.deserialize(response)),
      tap(() => AlertStore.info(`Metro ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public upsertIsland(island: IAPIIsland): Observable<IslandModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    const isNewRequest: boolean = island.id === 0;
    const upsertRequest: Observable<IAPIIsland> = isNewRequest
      ? http.post<IAPIIsland>(apiUrls.island, island)
      : http.put<IAPIIsland>(`${apiUrls.island}/${island.id}`, island);

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIIsland) => IslandModel.deserialize(response)),
      tap(() => AlertStore.info(`Island ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public getAeronauticalInformationPublication(
    countryId?: number,
    request?: IAPIGridRequest
  ): Observable<IAPIPageResponse<AeronauticalInformationPublicationModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.AIP,
      ...Utilities.filters({ countryId }),
      ...request,
    });
    return from(
      http.post<any>('/graphql', { query: getGqlQuery(params, gqlItems.aip) })
    ).pipe(
      map(resp => {
        const collection = resp.data['aeronauticalInformationPublication'];
        return {
          pageNumber: request.pageNumber,
          pageSize: request.pageSize,
          totalNumberOfRecords: collection?.totalCount,
          results: AeronauticalInformationPublicationModel.deserializeList(collection?.items) || [],
        };
      })
    );
  }

  /* istanbul ignore next */
  public upsertAeronauticalInformationPublication(
    aip: AeronauticalInformationPublicationModel
  ): Observable<AeronauticalInformationPublicationModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    const isNewRequest: boolean = aip.id === 0;
    const upsertRequest: Observable<IAPIAeronauticalInformationPublication> = isNewRequest
      ? http.post<IAPIAeronauticalInformationPublication>(apiUrls.aip, aip.serialize())
      : http.put<IAPIAeronauticalInformationPublication>(`${apiUrls.aip}/${aip.id}`, aip.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIAeronauticalInformationPublication) =>
        AeronauticalInformationPublicationModel.deserialize(response)
      ),
      tap(() => AlertStore.info(`AIP ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public removeAeronauticalInformationPublication(aeronauticalInformationPublicationId: number): Observable<string> {
    const params = {
      aeronauticalInformationPublicationId,
    };
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    return http.delete<string>(`${apiUrls.aip}`, params).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('AIP deleted successfully!'))
    );
  }

  /* istanbul ignore next */
  public getAssociatedAIP(countryId?: number): Observable<AssociatedAIPModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    const params = Utilities.buildParamString({
      pageSize: 0,
      ...Utilities.filters({ countryId }),
    });
    return http.get<IAPIPageResponse<IAPIAssociatedAIP>>(`${apiUrls.associatedAip}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => AssociatedAIPModel.deserializeList(response.results))
    );
  }

  /* istanbul ignore next */
  public upsertAssociatedAIP(aip: AssociatedAIPModel): Observable<AssociatedAIPModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    const isNewRequest: boolean = aip.id === 0;
    const upsertRequest: Observable<IAPIAssociatedAIP> = isNewRequest
      ? http.post<IAPIAssociatedAIP>(apiUrls.associatedAip, aip.serialize())
      : http.put<IAPIAssociatedAIP>(`${apiUrls.associatedAip}/${aip.id}`, aip.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIAssociatedAIP) => AssociatedAIPModel.deserialize(response)),
      tap(() => AlertStore.info(`Associated AIP ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public removeAssociatedAIP(associatedAeronauticalInformationPublicationId: number): Observable<string> {
    const params = {
      associatedAeronauticalInformationPublicationId,
    };
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    return http.delete<string>(`${apiUrls.associatedAip}`, params).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('Associated AIP deleted successfully!'))
    );
  }


  /* istanbul ignore next */
  public getCapitalCities(countryId: number, searchValue: string = ''): Observable<BaseCityModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 10,
      collectionName: NO_SQL_COLLECTIONS.CITY,
      filterCollection: JSON.stringify([{ propertyName: 'Country.CountryId', propertyValue: countryId }]),
      searchCollection: JSON.stringify([
        { propertyName: 'OfficialName', propertyValue: searchValue, searchType: 'start', operator: 'and' },
        { propertyName: 'CommonName', propertyValue: searchValue, searchType: 'start', operator: 'or' },
      ]),
      specifiedFields: [ 'CommonName', 'OfficialName', 'CAPPSName', 'CAPPSCode', 'CityId', 'State' ],
    });

    return http.get<IAPIPageResponse<IAPICity>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => response.results.map(a => BaseCityModel.deserialize(a))),
      tapWithAction((response: BaseCityModel[]) => (this.capitalCities = response))
    );
  }
}
