import { EntityMapModel, IAPIGridRequest, SEARCH_ENTITY_TYPE, tapWithAction, Utilities } from '@wings-shared/core';
import { BaseCountryStore, BaseVendorStore, BaseAirportStore } from '@wings/shared';
import { observable } from 'mobx';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export class BaseEntityMapStore {
  @observable public countries: EntityMapModel[] = [];
  @observable public airports: EntityMapModel[] = [];
  @observable public vendors: EntityMapModel[] = [];
  @observable public vendorLocations: EntityMapModel[] = [];
  private baseCountryStore = new BaseCountryStore();
  private baseAirportStore = new BaseAirportStore();
  private baseVendorStore = new BaseVendorStore();

  /* istanbul ignore next */
  public searchEntities(searchValue: string, fieldKey: string): Observable<EntityMapModel[]> {
    let request: IAPIGridRequest;
    switch (fieldKey) {
      case 'weaponOnBoardVendors':
      case 'permissionVendors':
        request = Utilities.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.VENDOR);
        return this.loadModuleEntities(SEARCH_ENTITY_TYPE.VENDOR, request, fieldKey);
      case 'customOfficerDispacthedFromAirport':
      case 'appliedParkingAlternateAirports':
        return this.loadModuleEntities(SEARCH_ENTITY_TYPE.AIRPORT, null, null, searchValue);
      case 'appliedDisinsectionDepartureCountries':
        request = Utilities.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.COUNTRY);
        return this.loadModuleEntities(SEARCH_ENTITY_TYPE.COUNTRY, {
          ...request,
          specifiedFields: [ 'CountryId', 'CommonName', 'ISO2Code' ],
        });

      default:
        return of([]);
    }
  }

  /* istanbul ignore next */
  public loadModuleEntities(
    entity: string,
    request?: IAPIGridRequest,
    fieldKey?: string,
    searchValue?: string
  ): Observable<EntityMapModel[]> {
    switch (entity) {
      case SEARCH_ENTITY_TYPE.COUNTRY:
        return this.getCountriesMapping(request);
      case SEARCH_ENTITY_TYPE.AIRPORT:
        return this.getAirportsMapping(searchValue);
      case SEARCH_ENTITY_TYPE.VENDOR:
        return this.getVendors(fieldKey, request);
      default:
        return of([]);
    }
  }

  /* istanbul ignore next */
  public getCountriesMapping(request?: IAPIGridRequest): Observable<EntityMapModel[]> {
    return this.baseCountryStore.getCountries(request).pipe(
      map(({ results }) =>
        results.map(
          item =>
            new EntityMapModel({
              ...item,
              id: 0,
              name: item.commonName || item.isO2Code,
              entityId: item.id,
              code: item.isO2Code,
            })
        )
      ),
      tapWithAction(result => (this.countries = result))
    );
  }

  /* istanbul ignore next */
  public getAirportsMapping(searchValue): Observable<EntityMapModel[]> {
    return this.baseAirportStore.searchWingsAirports(searchValue).pipe(
      map(results => results.map(item => new EntityMapModel({ ...item, code: item.displayCode }))),
      tapWithAction(result => (this.airports = result))
    );
  }

  /* istanbul ignore next */
  public getVendorsMapping(request?: IAPIGridRequest): Observable<EntityMapModel[]> {
    return this.baseVendorStore.getVendors(request).pipe(tapWithAction(result => (this.vendors = result)));
  }

  /* istanbul ignore next */
  public getVendorLocationMapping(request?: IAPIGridRequest): Observable<EntityMapModel[]> {
    return this.baseVendorStore
      .getVendorLocations(request)
      .pipe(tapWithAction(result => (this.vendorLocations = result)));
  }

  public mapEntities(items, nameKey = 'name', idKey = 'id') {
    return items.map(item => new EntityMapModel({ ...item, id: 0, name: item[nameKey], entityId: item[idKey] }));
  }

  /* istanbul ignore next */
  public getVendors(fieldKey: string, request?: IAPIGridRequest): Observable<EntityMapModel[]> {
    switch (fieldKey) {
      case 'weaponOnBoardVendors':
      case 'permissionVendors':
        return this.getVendorsMapping(request);
      default:
        return of([]);
    }
  }
}
