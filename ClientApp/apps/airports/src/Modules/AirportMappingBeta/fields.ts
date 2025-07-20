
import { IAPIFilterDictionary } from '@wings-shared/core';
import { AIRPORT_MAPPING_BETA_FILTERS } from '../Shared';

export const gridFilters: IAPIFilterDictionary<AIRPORT_MAPPING_BETA_FILTERS>[] = [
  {
    columnId: 'icaoCode',
    apiPropertyName: 'ICAOCode.Code',
    uiFilterType: AIRPORT_MAPPING_BETA_FILTERS.ICAO,
  },
  {
    columnId: 'regionalAirportCode',
    apiPropertyName: 'RegionalAirportCode.Code',
    uiFilterType: AIRPORT_MAPPING_BETA_FILTERS.Regional,
  },
  {
    columnId: 'airportFlightPlanInfo.apgCode',
    apiPropertyName: 'AirportFlightPlanInfo.APGCode',
    uiFilterType: AIRPORT_MAPPING_BETA_FILTERS.APG,
  },
  {
    columnId: 'airportFlightPlanInfo.navBlueCode',
    apiPropertyName: 'AirportFlightPlanInfo.NavBlueCode',
    uiFilterType: AIRPORT_MAPPING_BETA_FILTERS.NAVBLUE,
  },
  {
    columnId: 'uwaAirportCode',
    apiPropertyName: 'UWAAirportCode.Code',
    uiFilterType: AIRPORT_MAPPING_BETA_FILTERS.UWA,
  },
  {
    columnId: 'faaCode',
    apiPropertyName: 'FAACode',
    uiFilterType: AIRPORT_MAPPING_BETA_FILTERS.FAA,
  },
];
