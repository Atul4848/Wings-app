import { baseGridFiltersDictionary } from '@wings/shared';
import { AIRPORT_MAPPING_FILTERS } from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const gridFilters: IAPIFilterDictionary<AIRPORT_MAPPING_FILTERS>[] = [
  ...baseGridFiltersDictionary<AIRPORT_MAPPING_FILTERS>(),
  {
    columnId: 'icao',
    apiPropertyName: 'icao',
    uiFilterType: AIRPORT_MAPPING_FILTERS.ICAO,
  },
  {
    columnId: 'navblueCode',
    apiPropertyName: 'navblueCode',
    uiFilterType: AIRPORT_MAPPING_FILTERS.NAVBLUE,
  },
  {
    columnId: 'apgCode',
    apiPropertyName: 'apgCode',
    uiFilterType: AIRPORT_MAPPING_FILTERS.APG,
  },
  
];
