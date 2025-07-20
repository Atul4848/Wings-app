import { CityModel, CountryModel, RegionModel, StateModel } from '@wings/shared';
import { ICellEditorComp } from 'ag-grid-community';
import { GeoFilter } from '../Tools';
import { expect } from 'chai';

describe('Event Geo Filter', () => {
  const selectedCountries: CountryModel[] = [
    new CountryModel({
      id: 1,
      name: 'TEST-A',
      isO2Code: 'TS',
      associatedRegions: [new RegionModel({ regionId: 1, name: 'EAST' })],
    }),
    new CountryModel({
      id: 2,
      name: 'TEST-B',
      isO2Code: 'BN',
      associatedRegions: [new RegionModel({ regionId: 2, name: 'WEST' })],
    }),
    new CountryModel({ id: 3, name: 'TEST-D', isO2Code: 'VB' }),
    new CountryModel({ id: 4, name: 'TEST-C', isO2Code: 'GH' }),
  ];

  const selectedStates: StateModel[] = [
    new StateModel({ id: 1, name: 'STATE-A', country: new CountryModel({ id: 1, code: 'TS' }) }),
    new StateModel({ id: 2, name: 'STATE-D', country: new CountryModel({ id: 2, code: 'BN' }) }),
    new StateModel({ id: 3, name: 'STATE-B', country: new CountryModel({ id: 3, code: 'VB' }) }),
    new StateModel({ id: 4, name: 'STATE-C', country: new CountryModel({ id: 4, code: 'GH' }) }),
    new StateModel({ id: 5, name: 'STATE-F', country: new CountryModel({ id: 5, code: 'GH' }) }),
  ];

  const selectedCities: CityModel[] = [
    new CityModel({
      id: 1,
      name: 'CITY-A',
      country: new CountryModel({ id: 6, code: 'TS' }),
      state: new StateModel({ id: 6 }),
    }),
    new CityModel({
      id: 2,
      name: 'CITY-B',
      country: new CountryModel({ id: 2, isO2Code: 'BN' }),
      state: new StateModel({ id: 2, country: new CountryModel({ id: 2, isO2Code: 'TN' }) }),
    }),
    new CityModel({
      id: 3,
      name: 'CITY-C',
      country: new CountryModel({ id: 3, isO2Code: 'BN' }),
      state: new StateModel({ id: 3, country: new CountryModel({ id: 3, isO2Code: 'TC' }) }),
    }),
  ];

  const regions: RegionModel[] = [
    new RegionModel({ id: 1, name: 'East' }),
    new RegionModel({ id: 2, name: 'West' }),
    new RegionModel({ id: 3, name: 'North' }),
  ];

  const countryInstance: ICellEditorComp = {
    getValue: () => selectedCountries,
    getGui: () => null,
  };

  const stateInstance: ICellEditorComp = {
    getValue: () => selectedStates,
    getGui: () => null,
  };

  const cityInstance: ICellEditorComp = {
    getValue: () => selectedCities,
    getGui: () => null,
  };

  const regionInstance: ICellEditorComp = {
    getValue: () => regions,
    getGui: () => null,
  };

  const geoFilters = new GeoFilter({ countryInstance, stateInstance, cityInstance, regionInstance });

  it('should called filteredStates method', () => {
    expect(geoFilters.filteredStates).to.have.length(4);
  });

  it('should called getFilteredCitiesByCountries method', () => {
    expect(geoFilters.filteredCitiesByCountries).to.have.length(2);
  });

  it('should called getFilteredRegions method', () => {
    expect(geoFilters.filteredRegions).to.have.length(2);
  });

  it('should called getFilteredCitiesByStates method', () => {
    expect(geoFilters.filteredCitiesByStates).to.have.length(2);
  });
});
