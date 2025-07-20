import { baseGridFiltersDictionary } from '@wings/shared';
import { CITY_FILTERS } from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const cityGridFilters: IAPIFilterDictionary<CITY_FILTERS>[] = [
  ...baseGridFiltersDictionary<CITY_FILTERS>(),
  { columnId: 'officialName', apiPropertyName: 'OfficialName', uiFilterType: CITY_FILTERS.CITY_NAME },
  { columnId: 'commonName', apiPropertyName: 'CommonName', uiFilterType: CITY_FILTERS.COMMON_NAME },
  { columnId: 'cappsName', apiPropertyName: 'CAPPSName', uiFilterType: CITY_FILTERS.CAPPS_NAME },
  { columnId: 'cappsCode', apiPropertyName: 'CAPPSCode', uiFilterType: CITY_FILTERS.CAPPS_CODE },
  { columnId: 'state', apiPropertyName: 'State.Code', uiFilterType: CITY_FILTERS.STATE_CODE },
  { columnId: 'country', apiPropertyName: 'Country.Code', uiFilterType: CITY_FILTERS.COUNTRY_CODE },
  { columnId: 'latitude', apiPropertyName: 'Latitude' },
  { columnId: 'longitude', apiPropertyName: 'Longitude' },
  { columnId: 'metro', apiPropertyName: 'MSA.Name' },
  { columnId: 'cityAlternateNames', apiPropertyName: 'AlternateNames' },
  { columnId: 'cappsShortName', apiPropertyName: 'CAPPSShortName' },
];
