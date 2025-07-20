import { baseGridFiltersDictionary } from '@wings/shared';
import { IAPIFilterDictionary } from '@wings-shared/core';
import { AIRPORT_TIME_ZONE_MAPPING } from '../Shared';

export const gridFilters: IAPIFilterDictionary<AIRPORT_TIME_ZONE_MAPPING>[] = [
  ...baseGridFiltersDictionary<AIRPORT_TIME_ZONE_MAPPING>(),
  {
    columnId: 'airportCode',
    apiPropertyName: 'Airport Code',
    uiFilterType: AIRPORT_TIME_ZONE_MAPPING.AIRPORT_CODE,
  },
  {
    columnId: 'airportName',
    apiPropertyName: 'Airport Name',
    uiFilterType: AIRPORT_TIME_ZONE_MAPPING.AIRPORT_NAME,
  },
  {
    columnId: 'timezoneRegionName',
    apiPropertyName: 'Region Name',
    uiFilterType: AIRPORT_TIME_ZONE_MAPPING.REGION_NAME,
  },
];
