import { baseGridFiltersDictionary } from '@wings/shared';
import { IAPIFilterDictionary } from '@wings-shared/core';
import { TIME_ZONE_FILTERS } from '../Shared';

export const gridFilters: IAPIFilterDictionary<TIME_ZONE_FILTERS>[] = [
  ...baseGridFiltersDictionary<TIME_ZONE_FILTERS>(),
  {
    columnId: 'timezoneCountryName',
    apiPropertyName: 'Country Name',
    uiFilterType: TIME_ZONE_FILTERS.COUNTRY_NAME,
  },
  {
    columnId: 'timezoneRegionName',
    apiPropertyName: 'Region Name',
    uiFilterType: TIME_ZONE_FILTERS.REGION_NAME,
  },
  {
    columnId: 'zoneName',
    apiPropertyName: 'Zone Name',
    uiFilterType: TIME_ZONE_FILTERS.ZONE_NAME,
  },
  {
    columnId: 'zoneAbbreviation',
    apiPropertyName: 'Zone Abbreviation',
    uiFilterType: TIME_ZONE_FILTERS.ZONE_ABBREVIATION,
  },
];
