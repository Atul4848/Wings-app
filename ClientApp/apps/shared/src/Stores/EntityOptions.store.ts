import { BaseCountryStore, BaseStore, BaseAirportStore, BaseVendorStore } from './index';
import { action, observable } from 'mobx';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { IAPIGridRequest, SEARCH_ENTITY_TYPE, tapWithAction, EntityMapModel } from '@wings-shared/core';
export class EntityOptionsStore extends BaseStore {
  private readonly countryStore = new BaseCountryStore();
  private readonly airportStore = new BaseAirportStore();
  private readonly baseVendorStore = new BaseVendorStore();
  @observable public countries: EntityMapModel[] = [];
  @observable public states: EntityMapModel[] = [];
  @observable public wingsAirports: EntityMapModel[] = [];
  @observable public firs: EntityMapModel[] = [];
  @observable public regions: EntityMapModel[] = [];
  @observable public cities: EntityMapModel[] = [];
  @observable public metros: EntityMapModel[] = [];
  @observable public vendors: EntityMapModel[] = [];
  @observable public vendorsLocation: EntityMapModel[] = [];
  @action
  public clearEntity(entityType: SEARCH_ENTITY_TYPE): void {
    switch (entityType) {
      case SEARCH_ENTITY_TYPE.COUNTRY:
        this.countries = [];
        break;
      case SEARCH_ENTITY_TYPE.STATE:
        this.states = [];
        break;
      case SEARCH_ENTITY_TYPE.FIR:
        this.firs = [];
        break;
      case SEARCH_ENTITY_TYPE.AIRPORT:
        this.wingsAirports = [];
        break;
    }
  }

  // Get Level Entities based on related level field
  public getEntityOptions(fieldLevel: SEARCH_ENTITY_TYPE): EntityMapModel[] {
    switch (fieldLevel) {
      case SEARCH_ENTITY_TYPE.COUNTRY:
        return this.countries;
      case SEARCH_ENTITY_TYPE.STATE:
        return this.states;
      case SEARCH_ENTITY_TYPE.FIR:
        return this.firs;
      case SEARCH_ENTITY_TYPE.AIRPORT:
        return this.wingsAirports;
      case SEARCH_ENTITY_TYPE.REGION:
        return this.regions;
      case SEARCH_ENTITY_TYPE.CITY:
        return this.cities;
      case SEARCH_ENTITY_TYPE.METRO:
        return this.metros;
      default:
        return [];
    }
  }

  // Search Entity based on field value
  public searchEntity(
    searchEntityType: SEARCH_ENTITY_TYPE,
    request: IAPIGridRequest,
    searchValue?: string,
    codeProperty?: string
  ): Observable<EntityMapModel[]> {
    switch (searchEntityType) {
      case SEARCH_ENTITY_TYPE.COUNTRY:
        return this.countryStore.getCountries(request).pipe(
          map(response =>
            response.results.map(
              entity =>
                new EntityMapModel({
                  entityId: entity.id,
                  name: entity.commonName,
                  code: entity.isO2Code,
                  status: entity.status,
                })
            )
          ),
          tapWithAction(response => (this.countries = response))
        );
      case SEARCH_ENTITY_TYPE.STATE:
        return this.countryStore.getStates(request).pipe(
          map(({ results }) =>
            results.map(
              entity =>
                new EntityMapModel({
                  ...entity,
                  entityId: entity.id,
                  name: entity.commonName,
                  code: codeProperty ? entity[codeProperty] : entity.isoCode || entity.code || entity.cappsCode,
                })
            )
          ),
          tapWithAction(response => (this.states = response))
        );
      case SEARCH_ENTITY_TYPE.FIR:
        return this.countryStore.getFIRs(request).pipe(
          map(({ results }) =>
            results.map(entity => new EntityMapModel({ entityId: entity.id, name: entity.name, code: entity.code }))
          ),
          tapWithAction(response => (this.firs = response))
        );
      case SEARCH_ENTITY_TYPE.AIRPORT:
        return this.airportStore.searchWingsAirports(searchValue, true).pipe(
          map(response =>
            response.map(
              entity =>
                new EntityMapModel({
                  entityId: entity.id,
                  name: entity.name || entity.icaoOrUwaCode,
                  code: entity.icaoOrUwaCode || entity.displayCode,
                })
            )
          ),
          tapWithAction(response => (this.wingsAirports = response))
        );
      case SEARCH_ENTITY_TYPE.REGION:
        return this.countryStore.getRegions(request).pipe(
          map(response =>
            response.results.map(
              entity =>
                new EntityMapModel({
                  entityId: entity.id,
                  name: entity.name,
                  code: entity.code,
                  status: entity.status,
                })
            )
          ),
          tapWithAction(response => (this.regions = response))
        );
      case SEARCH_ENTITY_TYPE.CITY:
        return this.countryStore.getCities(request).pipe(
          map(response =>
            response.results.map(
              entity =>
                new EntityMapModel({
                  ...entity,
                  entityId: entity.id,
                  name: entity.commonName,
                  code: entity.cappsCode,
                })
            )
          ),
          tapWithAction(response => (this.cities = response))
        );
      case SEARCH_ENTITY_TYPE.METRO:
        return this.countryStore.getMetros(request).pipe(
          map(response =>
            response.map(
              entity =>
                new EntityMapModel({
                  entityId: entity.id,
                  name: entity.name,
                })
            )
          ),
          tapWithAction(response => (this.metros = response))
        );
      case SEARCH_ENTITY_TYPE.VENDOR:
        return this.baseVendorStore.getVendors(request).pipe(tapWithAction(result => (this.vendors = result)));
      case SEARCH_ENTITY_TYPE.VENDOR_LOCATION:
        return this.baseVendorStore
          .getVendorLocationsV2(request)
          .pipe(tapWithAction(result => (this.vendorsLocation = result)));
      default:
        return of([]);
    }
  }
}
