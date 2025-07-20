import { baseGridFiltersDictionary } from '@wings/shared';
import { IAPIFilterDictionary } from '@wings-shared/core';
import { PERFORMANCE_FILTERS } from '../Shared';

export const performanceGridFilters: IAPIFilterDictionary<PERFORMANCE_FILTERS>[] = [
  ...baseGridFiltersDictionary<PERFORMANCE_FILTERS>(),
  {
    columnId: 'name',
    apiPropertyName: 'Name',
    uiFilterType: PERFORMANCE_FILTERS.NAME,
  },
  {
    columnId: 'maxFlightLevel',
    apiPropertyName: 'MaxFlightLevel',
  },
  {
    columnId: 'defaultCruiseSchedule',
    apiPropertyName: 'DefaultCruiseSchedule.Profile',
    uiFilterType: PERFORMANCE_FILTERS.CRUISE_SCHEDULE,
  },
  {
    columnId: 'mtowInPounds',
    apiPropertyName: 'MTOWInPounds',
  },
  {
    columnId: 'mtowInKilos',
    apiPropertyName: 'MTOWInKilos',
  },
  {
    columnId: 'defaultDescentSchedule',
    apiPropertyName: 'DefaultDescentSchedule.Profile',
    uiFilterType: PERFORMANCE_FILTERS.DESCENT_SCHEDULE,
  },
  {
    columnId: 'defaultClimbSchedule',
    apiPropertyName: 'DefaultClimbSchedule.Profile',
    uiFilterType: PERFORMANCE_FILTERS.CLIMB_SCHEDULE,
  },
  {
    columnId: 'defaultHoldSchedule',
    apiPropertyName: 'DefaultHoldSchedule.Profile',
    uiFilterType: PERFORMANCE_FILTERS.HOLD_SCHEDULE,
  },
  {
    columnId: 'icaoTypeDesignator',
    apiPropertyName: 'ICAOTypeDesignator.Name',
    uiFilterType: PERFORMANCE_FILTERS.ICAO,
  },
  {
    columnId: 'wakeTurbulenceCategory',
    apiPropertyName: 'WakeTurbulenceCategory.Name',
    uiFilterType: PERFORMANCE_FILTERS.WAKE_TURBULENCE_CATEGORY,
  },
  {
    columnId: 'performanceLinks',
    apiPropertyName: 'PerformanceLinks.Link',
    uiFilterType: PERFORMANCE_FILTERS.WAKE_TURBULENCE_CATEGORY,
  },
  {
    columnId: 'comments',
    apiPropertyName: 'Comments',
    uiFilterType: PERFORMANCE_FILTERS.COMMENTS,
  },
];




