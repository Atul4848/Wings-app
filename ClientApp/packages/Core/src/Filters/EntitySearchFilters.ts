import { IAPISearchFilter, IAPISearchFiltersDictionary } from '../Interfaces';
import { SEARCH_ENTITY_TYPE } from '../Enums';

export const baseEntitySearchFilters: IAPISearchFiltersDictionary = {
  [SEARCH_ENTITY_TYPE.COUNTRY]: {
    searchFilters: [
      { propertyName: 'CommonName', operator: 'and' },
      { propertyName: 'ISO2Code', operator: 'or' },
    ],
    specifiedFields: [ 'CommonName', 'CountryId', 'ISO2Code', 'Status' ],
  },
  [SEARCH_ENTITY_TYPE.AIRPORT]: {
    searchFilters: [{ propertyName: 'ICAO' }],
    specifiedFields: [
      'AirportId',
      'ICAOCode',
      'UWACode',
      'IATACode',
      'FAACode',
      'Name',
      'CAPPSAirportName',
      'AirportLocation.ClosestCity',
      'AirportLocation.City',
      'AirportLocation.State',
      'AirportLocation.Country',
    ],
  },
  [SEARCH_ENTITY_TYPE.STATE]: {
    searchFilters: [
      { propertyName: 'CommonName', operator: 'and' },
      { propertyName: 'ISOCode', operator: 'or' },
    ],
    specifiedFields: [ 'CommonName', 'OfficialName', 'Code', 'ISOCode', 'CappsCode', 'StateId', 'Country' ],
  },
  [SEARCH_ENTITY_TYPE.CITY]: {
    searchFilters: [
      { propertyName: 'OfficialName', operator: 'and', searchType: 'start' },
      { propertyName: 'CommonName', operator: 'or', searchType: 'start' },
    ],
    specifiedFields: [ 'CommonName', 'OfficialName', 'CAPPSName', 'CAPPSCode', 'CityId', 'State', 'Country' ],
  },
  [SEARCH_ENTITY_TYPE.FAR_TYPE]: {
    searchFilters: [{ propertyName: 'Name' }],
  },
  [SEARCH_ENTITY_TYPE.FIR]: {
    searchFilters: [
      { propertyName: 'Name', operator: 'and' },
      { propertyName: 'Code', operator: 'or' },
    ],
  },
  [SEARCH_ENTITY_TYPE.ICAO_CODE]: {
    searchFilters: [{ propertyName: 'Code' }],
    specifiedFields: [ 'ICAOCodeId', 'Code' ],
  },
  [SEARCH_ENTITY_TYPE.REGION]: {
    searchFilters: [{ propertyName: 'Name' }],
    specifiedFields: [ 'RegionId', 'Name', 'Code', 'RegionType', 'Status' ],
  },
  [SEARCH_ENTITY_TYPE.VENDOR]: {
    searchFilters: [
      { propertyName: 'Name', operator: 'and' },
      { propertyName: 'Code', operator: 'or' },
      { propertyName: 'AirportReference.DisplayCode', operator: 'or' },
      { propertyName: 'AirportReference.ICAOCode', operator: 'or' },
      { propertyName: 'AirportReference.UWACode', operator: 'or' },
      { propertyName: 'AirportReference.IATACode', operator: 'or' },
      { propertyName: 'AirportReference.FAACode', operator: 'or' },
      { propertyName: 'AirportReference.RegionalCode', operator: 'or' },
    ]},
    [SEARCH_ENTITY_TYPE.VENDOR_LOCATION]: {
      searchFilters: [
        { propertyName: 'Name', operator: 'and' },
        { propertyName: 'AirportReference.DisplayCode', operator: 'or' },
        { propertyName: 'AirportReference.ICAOCode', operator: 'or' },
        { propertyName: 'AirportReference.UWACode', operator: 'or' },
        { propertyName: 'AirportReference.IATACode', operator: 'or' },
        { propertyName: 'AirportReference.FAACode', operator: 'or' },
        { propertyName: 'AirportReference.RegionalCode', operator: 'or' },
      ],
  },
};

// Include this filter if you want capps code should be there
/* istanbul ignore next */
export const shouldNotNullFilter = (propertyName: string): IAPISearchFilter => ({
  propertyName,
  operator: 'and',
  propertyValue: null,
  filterType: 'ne',
});
