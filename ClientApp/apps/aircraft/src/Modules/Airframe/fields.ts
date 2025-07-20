import { baseGridFiltersDictionary } from '@wings/shared';
import { AIRFRAME_FILTERS } from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const gridFilters: IAPIFilterDictionary<AIRFRAME_FILTERS>[] = [
  ...baseGridFiltersDictionary<AIRFRAME_FILTERS>(),
  {
    columnId: 'serialNumber',
    apiPropertyName: 'SerialNumber',
    uiFilterType: AIRFRAME_FILTERS.SERIAL_NUMBER,
  },
  {
    columnId: 'aircraftVariation.series',
    apiPropertyName: 'AircraftVariation.Series.Name',
    uiFilterType: AIRFRAME_FILTERS.SERIES,
  },
  {
    columnId: 'airframeStatus',
    apiPropertyName: 'AirframeStatus.Name',
    uiFilterType: AIRFRAME_FILTERS.AIRFRAME_STATUS,
  },
  {
    columnId: 'airworthinessRecentDate',
    apiPropertyName: 'AirworthinessRecentDate',
    uiFilterType: AIRFRAME_FILTERS.AIRWORTHINESS_DATE,
  },
  {
    columnId: 'aircraftVariation.cappsId',
    apiPropertyName: 'AircraftVariation.CAPPSId',
    uiFilterType: AIRFRAME_FILTERS.VARIATION,
  },
  {
    columnId: 'registries',
    apiPropertyName: 'AirframeRegistries.Registry.Name',
    uiFilterType: AIRFRAME_FILTERS.REGISTRY,
  },
  {
    columnId: 'aircraftVariation.icaoTypeDesignator',
    apiPropertyName: 'AircraftVariation.ICAOTypeDesignator.Name',
    uiFilterType: AIRFRAME_FILTERS.ICAO_TYPE,
  },
  {
    columnId: 'aircraftVariation.make',
    apiPropertyName: 'AircraftVariation.Make.Name',
    uiFilterType: AIRFRAME_FILTERS.MAKE,
  },
  {
    columnId: 'aircraftVariation.model',
    apiPropertyName: 'AircraftVariation.Model.Name',
    uiFilterType: AIRFRAME_FILTERS.MODEL,
  },
  {
    columnId: 'airframeWeightAndLength.maxTakeOffWeight',
    apiPropertyName: 'AirframeWeightAndLength.MaxTakeOffWeight',
    uiFilterType: AIRFRAME_FILTERS.MTOW,
  },
  {
    columnId: 'crewSeatCap',
    apiPropertyName: 'CrewSeatCap',
  },
  {
    columnId: 'paxSeatCap',
    apiPropertyName: 'PaxSeatCap',
  },
  { columnId: 'manufactureDate', apiPropertyName: 'ManufactureDate' },
  { columnId: 'temporaryEngineDate', apiPropertyName: 'TemporaryEngineDate' },
];

export const airframeFilterOptions = [
  AIRFRAME_FILTERS.VARIATION,
  AIRFRAME_FILTERS.MTOW,
  AIRFRAME_FILTERS.AIRWORTHINESS_DATE,
];
