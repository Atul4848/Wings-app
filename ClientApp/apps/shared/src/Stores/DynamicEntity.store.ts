import { action } from 'mobx';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityMapModel } from '@wings-shared/core';
import { BaseStore } from './Base.store';
import { BaseCountryStore } from './BaseCountry.store';
import { BaseAirportStore } from './BaseAirport.store';
import { BaseVendorStore } from './BaseVendor.store';
import { DynamicEntityModel } from '../Models';
import { SettingsBaseStore } from './SettingsBase.store';

// Do not include any new variable in this file this store has single responsibility
// to manage dynamic entity search
export class DynamicEntityStore extends BaseStore {
  private baseCountryStore = new BaseCountryStore();
  private baseAirportStore = new BaseAirportStore();
  private baseVendorStore = new BaseVendorStore();
  private settingsBaseStore = new SettingsBaseStore('');

  public mapEntities(items, nameKey = 'name', idKey = 'id') {
    return items.map(item => new EntityMapModel({ ...item, id: 0, name: item[nameKey], entityId: item[idKey] }));
  }

  @action
  searchEntity = (searchValue: string, entityKey: any): Observable<DynamicEntityModel[]> => {
    let entitySearch = of([] as any[]);

    switch (entityKey) {
      case 'airport':
        entitySearch = this.baseAirportStore.searchWingsAirports(searchValue);
        break;
      case 'airportofentry':
        entitySearch = this.settingsBaseStore.loadAirportOfEntries();
        break;
      case 'country':
        entitySearch = this.baseCountryStore.searchCountries(searchValue);
        break;
      case 'city':
        entitySearch = this.baseCountryStore.searchCities({ searchValue }, false, false);
        break;
      case 'state':
        entitySearch = this.baseCountryStore.searchStates({ searchValue });
        break;
      case 'region':
        entitySearch = this.baseCountryStore.searchRegions(searchValue);
        break;
      case 'fir':
        entitySearch = this.baseCountryStore.searchFirs(searchValue);
        break;
      case 'fartype':
        entitySearch = this.settingsBaseStore.getFarTypes();
        break;
      case 'aircraftcategory':
        entitySearch = this.settingsBaseStore.getAircraftCategories();
        break;
      case 'purposeofflight':
        entitySearch = this.settingsBaseStore.getFlightPurposes();
        break;
      case 'crossingtype':
        entitySearch = this.settingsBaseStore.getCrossingTypes();
        break;
      case 'noisechapter':
        entitySearch = this.settingsBaseStore.getNoiseChapters();
        break;
    }
    return entitySearch.pipe(map(items => DynamicEntityModel.mapToList(items, entityKey)));
  };
}
