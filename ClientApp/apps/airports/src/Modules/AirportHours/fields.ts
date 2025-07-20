import { baseGridFiltersDictionary } from '@wings/shared';
import { AIRPORT_HOUR_FILTERS } from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const airportHoursGridFilters: IAPIFilterDictionary<AIRPORT_HOUR_FILTERS>[] = [
  ...baseGridFiltersDictionary<AIRPORT_HOUR_FILTERS>(),
  {
    columnId: 'icao',
    apiPropertyName: 'ICAO',
    uiFilterType: AIRPORT_HOUR_FILTERS.ICAO,
  },
  {
    columnId: 'airport.label',
    apiPropertyName: 'Airport.DisplayCode',
    uiFilterType: AIRPORT_HOUR_FILTERS.AIRPORT_CODE,
  },
  {
    columnId: 'airportHoursType.name',
    apiPropertyName: 'AirportHoursType.Name',
    uiFilterType: AIRPORT_HOUR_FILTERS.AIRPORT_HOURS_TYPE,
  },
  {
    columnId: 'airportHoursSubType.name',
    apiPropertyName: 'AirportHoursSubType.Name',
    uiFilterType: AIRPORT_HOUR_FILTERS.AIRPORT_HOURS_SUB_TYPE,
  },
  {
    columnId: 'scheduleSummary',
    apiPropertyName: 'ScheduleSummary',
  },
  {
    columnId: 'condition.conditionType.name',
    apiPropertyName: 'Condition.ConditionType.Name',
  },
  {
    columnId: 'condition.conditionValues',
    apiPropertyName: 'Condition.ConditionValues',
  },
  {
    columnId: 'schedule.is24Hours',
    apiPropertyName: 'Schedule.Is24Hours',
  },
  {
    columnId: 'schedule.startDate',
    apiPropertyName: 'Schedule.StartDate',
  },
  {
    columnId: 'schedule.endDate',
    apiPropertyName: 'Schedule.EndDate',
  },
  {
    columnId: 'schedule.startTime.time',
    apiPropertyName: 'Schedule.StartTime.Time',
  },
  {
    columnId: 'schedule.endTime.time',
    apiPropertyName: 'Schedule.EndTime.Time',
  },
  {
    columnId: 'scheduleSummary',
    apiPropertyName: 'ScheduleSummary',
  },
  {
    columnId: 'status',
    apiPropertyName: 'Status',
  },
];
