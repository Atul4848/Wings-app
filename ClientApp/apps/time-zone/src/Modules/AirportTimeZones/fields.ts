import { baseGridFiltersDictionary } from '@wings/shared';
import { IAPIFilterDictionary } from '@wings-shared/core';
import { TIME_ZONE_DETAIL_FILTERS, TIME_ZONE_FILTERS } from '../Shared';

export const gridFilters: IAPIFilterDictionary<TIME_ZONE_DETAIL_FILTERS>[] = [
  ...baseGridFiltersDictionary<TIME_ZONE_DETAIL_FILTERS>(),
  {
    columnId: 'airportCode',
    apiPropertyName: 'Country Name',
    uiFilterType: TIME_ZONE_DETAIL_FILTERS.AIRPORT_CODE,
  },
  {
    columnId: 'timezoneRegionName',
    apiPropertyName: 'Region Name',
    uiFilterType: TIME_ZONE_DETAIL_FILTERS.REGION_NAME,
  },
  {
    columnId: 'timezoneName',
    apiPropertyName: 'Zone Name',
    uiFilterType: TIME_ZONE_DETAIL_FILTERS.ZONE_NAME,
  },
  {
    columnId: 'timezoneAbbreviation',
    apiPropertyName: 'Zone Abbreviation',
    uiFilterType: TIME_ZONE_DETAIL_FILTERS.ZONE_ABBREVIATION,
  },
];
