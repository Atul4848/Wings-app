import { CountryStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { AeronauticalInformationPublicationModel, AssociatedAIPModel, ContinentModel } from '../Models';
import {
  CityModel,
  CountryModel,
  MetroModel,
  StateModel,
  IslandModel,
  ICountryRequest,
  SovereignCountryModel,
  IAPIIsland,
  BaseCityModel,
  RegionModel,
} from '@wings/shared';
import { map, tap } from 'rxjs/operators';
import { IAPIAssociatedAipRequest } from '../Interfaces';
import {
  AuditHistoryModel,
  IAPIGridRequest,
  IAPIPageResponse,
  SettingsTypeModel,
} from '@wings-shared/core';

export class CountryStoreMock extends CountryStore {
  public getCountries(request?: IAPIGridRequest): Observable<IAPIPageResponse<CountryModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new CountryModel({ commonName: 'TEST' }), new CountryModel() ],
    }).pipe(tap((response: IAPIPageResponse<CountryModel>) => (this.countries = response.results)));
  }

  public getTerritories(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]);
  }

  public getStates(request?: IAPIGridRequest): Observable<IAPIPageResponse<StateModel>> {
    const results: StateModel[] = [ new StateModel(), new StateModel() ];
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results }).pipe(
      tap((response: IAPIPageResponse<StateModel>) => (this.states = response.results))
    );
  }

  public upsertState(state: StateModel): Observable<StateModel> {
    return of(new StateModel());
  }

  public getCities(request: IAPIGridRequest): Observable<IAPIPageResponse<CityModel>> {
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results: [ new CityModel(), new CityModel() ] });
  }

  public loadContinents(): void {
    this.continents = [ new ContinentModel(), new ContinentModel() ];
  }

  public getMetros(): Observable<MetroModel[]> {
    return of([ new MetroModel(), new MetroModel() ]);
  }

  public upsertCity(city: CityModel): Observable<CityModel> {
    return of(new CityModel());
  }

  public upsertContinent(continent: ContinentModel): Observable<ContinentModel> {
    return of(new ContinentModel());
  }

  public getSovereignty(isTerritory: boolean): Observable<SovereignCountryModel[]> {
    return of([ new SovereignCountryModel(), new SovereignCountryModel() ]);
  }

  public getCountryById(countryId: number): Observable<CountryModel> {
    return of(new CountryModel());
  }

  public getContinents(): Observable<ContinentModel[]> {
    return of([ new ContinentModel(), new ContinentModel(), new ContinentModel({ id: 10 }) ]).pipe(
      tap((continents: ContinentModel[]) => (this.continents = continents))
    );
  }

  public upsertCountry(country: ICountryRequest): Observable<CountryModel> {
    return of(new CountryModel());
  }

  public upsertMetro(metro: MetroModel): Observable<MetroModel> {
    return of(new MetroModel());
  }
  public getIslands(request: IAPIGridRequest): Observable<IAPIPageResponse<IslandModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new IslandModel(), new IslandModel() ],
    });
  }

  public upsertIsland(island: IAPIIsland): Observable<IslandModel> {
    return of(new IslandModel());
  }

  /* istanbul ignore next */
  public loadAuditHistory(id: number, entityName: string): Observable<AuditHistoryModel[]> {
    return of([ new AuditHistoryModel({ id: 1 }) ]);
  }

  public getAeronauticalInformationPublication(
    countryId: number,
    request: IAPIGridRequest
  ): Observable<IAPIPageResponse<AeronauticalInformationPublicationModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new AeronauticalInformationPublicationModel({ id: 1 }) ],
    });
  }

  public upsertAeronauticalInformationPublication(
    aip: AeronauticalInformationPublicationModel
  ): Observable<AeronauticalInformationPublicationModel> {
    return of(new AeronauticalInformationPublicationModel());
  }

  /* istanbul ignore next */
  public getAssociatedAIP(countryId?: number): Observable<AssociatedAIPModel[]> {
    return of([ new AssociatedAIPModel() ]);
  }

  public getCapitalCities(countryId: number, searchValue: string = ''): Observable<BaseCityModel[]> {
    return of([ new BaseCityModel(), new BaseCityModel(), new BaseCityModel() ]);
  }

  public searchCountries(searchValue: string = ''): Observable<CountryModel[]> {
    if (!searchValue) {
      this.countries = [];
      return of([]);
    }
    return this.getCountries().pipe(map(x => x?.results || []));
  }

  public getRegions(request?: IAPIGridRequest): Observable<IAPIPageResponse<RegionModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new RegionModel(), new RegionModel() ],
    }).pipe(tap((response: IAPIPageResponse<RegionModel>) => (this.regions = response.results)));
  }

  public searchRegions(searchValue: string = ''): Observable<RegionModel[]> {
    if (!searchValue) {
      return of([]);
    }
    return this.getRegions().pipe(map(x => x?.results));
  }

  public upsertAssociatedAIP(aip: AssociatedAIPModel): Observable<AssociatedAIPModel> {
    return of(new AssociatedAIPModel());
  }
}
