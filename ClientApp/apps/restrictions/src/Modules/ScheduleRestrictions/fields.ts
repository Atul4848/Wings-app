import { baseGridFiltersDictionary } from '@wings/shared';
import { SCHEDULE_RESTRICTIONS_FILTERS } from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const gridFilters: IAPIFilterDictionary<SCHEDULE_RESTRICTIONS_FILTERS>[] = [
  ...baseGridFiltersDictionary<SCHEDULE_RESTRICTIONS_FILTERS>(),
  {
    columnId: 'restrictionType',
    apiPropertyName: 'RestrictionType.Name',
    uiFilterType: SCHEDULE_RESTRICTIONS_FILTERS.RESTRICTION_TYPE,
  },
  {
    columnId: 'restrictingEntities',
    apiPropertyName: 'RestrictingEntities.Code',
    uiFilterType: SCHEDULE_RESTRICTIONS_FILTERS.RESTRICTING_ENTITY,
  },
  {
    columnId: 'departureLevel',
    apiPropertyName: 'ScheduleDepartureLevel.Name',
    uiFilterType: SCHEDULE_RESTRICTIONS_FILTERS.DEPARTURE_LEVEL,
  },
  {
    columnId: 'departureLevelEntities',
    apiPropertyName: 'ScheduleDepartureLevelEntities.Code',
    uiFilterType: SCHEDULE_RESTRICTIONS_FILTERS.DEPARTURE_ENTITY,
  },
  {
    columnId: 'arrivalLevel',
    apiPropertyName: 'ScheduleArrivalLevel.Name',
    uiFilterType: SCHEDULE_RESTRICTIONS_FILTERS.ARRIVAL_LEVEL,
  },
  {
    columnId: 'arrivalLevelEntities',
    apiPropertyName: 'ScheduleArrivalLevelEntities.Code',
    uiFilterType: SCHEDULE_RESTRICTIONS_FILTERS.ARRIVAL_ENTITY,
  },
  {
    columnId: 'overFlightLevel',
    apiPropertyName: 'ScheduleOverFlightLevel.Name',
    uiFilterType: SCHEDULE_RESTRICTIONS_FILTERS.OVERFLIGHT_LEVEL,
  },
  {
    columnId: 'overFlightLevelEntities',
    apiPropertyName: 'ScheduleOverFlightLevelEntities.Code',
    uiFilterType: SCHEDULE_RESTRICTIONS_FILTERS.OVERFLIGHT_ENTITY,
  },
  {
    columnId: 'farTypes',
    apiPropertyName: 'FARTypes.Code',
    uiFilterType: SCHEDULE_RESTRICTIONS_FILTERS.FAR_TYPE,
  },
  { columnId: 'startDate', apiPropertyName: 'StartDate' },
  { columnId: 'endDate', apiPropertyName: 'EndDate' },
  { columnId: 'validatedDate', apiPropertyName: 'ValidatedDate' },
  { columnId: 'validatedBy', apiPropertyName: 'ValidatedBy' },
  { columnId: 'validationNotes', apiPropertyName: 'ValidationNotes' },
];
