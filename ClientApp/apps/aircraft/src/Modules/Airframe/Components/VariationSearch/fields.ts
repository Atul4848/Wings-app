import { baseGridFiltersDictionary } from '@wings/shared';
import { IAPIFilterDictionary } from '@wings-shared/core';
import { VARIATION_SEARCH_FILTERS } from '../../../Shared';

export const variationGridFilters: IAPIFilterDictionary<VARIATION_SEARCH_FILTERS>[] = [
  ...baseGridFiltersDictionary<VARIATION_SEARCH_FILTERS>(),
  {
    columnId: 'popularNames',
    apiPropertyName: 'AircraftVariationPopularNames.PopularName.Name',
    uiFilterType: VARIATION_SEARCH_FILTERS.POPULAR_NAMES,
  },
  { columnId: 'make', apiPropertyName: 'Make.Name', uiFilterType: VARIATION_SEARCH_FILTERS.MAKE },
  {
    columnId: 'model',
    apiPropertyName: 'Model.Name',
    uiFilterType: VARIATION_SEARCH_FILTERS.MODEL,
  },
  {
    columnId: 'series',
    apiPropertyName: 'Series.Name',
    uiFilterType: VARIATION_SEARCH_FILTERS.SERIES,
  },
  {
    columnId: 'engineType',
    apiPropertyName: 'EngineType.Name',
    uiFilterType: VARIATION_SEARCH_FILTERS.ENGINE_TYPE,
  },
  {
    columnId: 'icaoTypeDesignator',
    apiPropertyName: 'ICAOTypeDesignator.Name',
    uiFilterType: VARIATION_SEARCH_FILTERS.ICAO_TYPE_DESIGNATOR,
  },
];
