import { baseGridFiltersDictionary } from '@wings/shared';
import { AIRPORT_FILTERS } from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const gridFilters: IAPIFilterDictionary<AIRPORT_FILTERS>[] = [
  ...baseGridFiltersDictionary<AIRPORT_FILTERS>(),
  {
    columnId: 'icaoCode.code',
    apiPropertyName: 'ICAOCode.Code',
    uiFilterType: AIRPORT_FILTERS.ICAO,
  },
  {
    columnId: 'uwaAirportCode.code',
    apiPropertyName: 'UWAAirportCode.Code',
    uiFilterType: AIRPORT_FILTERS.UWACode,
  },
  {
    columnId: 'iataCode',
    apiPropertyName: 'IATACode',
    uiFilterType: AIRPORT_FILTERS.IATA,
  },
  {
    columnId: 'faaCode',
    apiPropertyName: 'FAACode',
    uiFilterType: AIRPORT_FILTERS.FAA_CODE,
  },
  {
    columnId: 'regionalAirportCode.code',
    apiPropertyName: 'RegionalAirportCode.Code',
    uiFilterType: AIRPORT_FILTERS.REGIONAL_CODE,
  },
  {
    columnId: 'sourceLocationId',
    apiPropertyName: 'SourceLocationId',
    uiFilterType: AIRPORT_FILTERS.SOURCE_LOCATION_ID,
  },
  {
    columnId: 'name',
    apiPropertyName: 'Name',
    uiFilterType: AIRPORT_FILTERS.NAME,
  },
  {
    columnId: 'cappsAirportName',
    apiPropertyName: 'CAPPSAirportName',
    uiFilterType: AIRPORT_FILTERS.CAPPS_AIRPORT_NAME,
  },
  {
    columnId: 'airportLocation.country',
    apiPropertyName: 'AirportLocation.Country.Name',
    uiFilterType: AIRPORT_FILTERS.COUNTRY,
  },
  {
    columnId: 'airportLocation.state',
    apiPropertyName: 'AirportLocation.State.Name',
    uiFilterType: AIRPORT_FILTERS.STATE,
  },
  {
    columnId: 'airportLocation.city',
    apiPropertyName: 'AirportLocation.City.Name',
    uiFilterType: AIRPORT_FILTERS.CITY,
  },
  { columnId: 'airportLocation.closestCity', apiPropertyName: 'AirportLocation.ClosestCity.Name' },
];

export const specifiedFields=[
  'AirportId',
  'DisplayCode',
  'ICAOCode',
  'UWAAirportCode',
  'IATACode',
  'FAACode',
  'RegionalAirportCode',
  'SourceLocationId',
  'Name',
  'CAPPSAirportName',
  'AirportLocation',
  'Status',
  'LatitudeCoordinate',
  'LongitudeCoordinate',
  'ModifiedBy',
  'ModifiedOn',
  'CreatedBy',
  'CreatedOn'
]
