import { baseGridFiltersDictionary } from '@wings/shared';
import { IAPIFilterDictionary } from '@wings-shared/core';
import { AIRCRAFT_VARIATION_FILTERS } from '../Shared';

export const aircraftVariationGridFilters: IAPIFilterDictionary<AIRCRAFT_VARIATION_FILTERS>[] = [
  ...baseGridFiltersDictionary<AIRCRAFT_VARIATION_FILTERS>(),
  {
    columnId: 'popularNames',
    apiPropertyName: 'AircraftVariationPopularNames.PopularName.Name',
    uiFilterType: AIRCRAFT_VARIATION_FILTERS.POPULAR_NAME,
  },
  { columnId: 'make', apiPropertyName: 'Make.Name', uiFilterType: AIRCRAFT_VARIATION_FILTERS.MAKE },
  {
    columnId: 'model',
    apiPropertyName: 'Model.Name',
    uiFilterType: AIRCRAFT_VARIATION_FILTERS.MODEL,
  },
  {
    columnId: 'series',
    apiPropertyName: 'Series.Name',
    uiFilterType: AIRCRAFT_VARIATION_FILTERS.SERIES,
  },
  {
    columnId: 'engineType',
    apiPropertyName: 'EngineType.Name',
    uiFilterType: AIRCRAFT_VARIATION_FILTERS.ENGINE,
  },
  {
    columnId: 'icaoTypeDesignator',
    apiPropertyName: 'ICAOTypeDesignator.Name',
    uiFilterType: AIRCRAFT_VARIATION_FILTERS.ICAO_TYPE,
  },
  // {
  //   columnId: 'wakeTurbulenceCategory',
  //   apiPropertyName: 'WakeTurbulenceCategory.Name',
  //   uiFilterType: AIRCRAFT_VARIATION_FILTERS.WAKE_TURBULENCE_CATEGORY,
  // },
  // {
  //   columnId: 'aircraftVariationOtherNames',
  //   apiPropertyName: 'AircraftVariationOtherNames.OtherName.Name',
  //   uiFilterType: AIRCRAFT_VARIATION_FILTERS.OTHER_NAME,
  // },
  // {
  //   columnId: 'aircraftVariationModifications',
  //   apiPropertyName: 'AircraftVariationModifications.AircraftModification.Name',
  //   uiFilterType: AIRCRAFT_VARIATION_FILTERS.MODIFICATION,
  // },
  // {
  //   columnId: 'aircraftVariationSTCManufactures',
  //   apiPropertyName: 'AircraftVariationSTCManufactures.STCManufacture.Name',
  //   uiFilterType: AIRCRAFT_VARIATION_FILTERS.STC_MANUFACTURE,
  // },
  // {
  //   columnId: 'cappsCruiseSchedule',
  //   apiPropertyName: 'CappsCruiseSchedule',
  //   uiFilterType: AIRCRAFT_VARIATION_FILTERS.CAPPA_CRUISE_SCHEDULE,
  // },
  // {
  //   columnId: 'aircraftVariationPerformances',
  //   apiPropertyName: 'AircraftVariationPerformances.Performance.Name',
  //   uiFilterType: AIRCRAFT_VARIATION_FILTERS.PERFORMANCE,
  // },
  // {
  //   columnId: 'comments',
  //   apiPropertyName: 'Comments',
  //   uiFilterType: AIRCRAFT_VARIATION_FILTERS.COMMENTS,
  // },
];
