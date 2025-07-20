import { baseGridFiltersDictionary } from '@wings/shared';
import { EVENT_FILTERS } from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const eventGridFilters: IAPIFilterDictionary<EVENT_FILTERS>[] = [
  ...baseGridFiltersDictionary<EVENT_FILTERS>(),
  { columnId: 'name', apiPropertyName: 'Name', uiFilterType: EVENT_FILTERS.EVENT_NAME },
  {
    columnId: 'description',
    apiPropertyName: 'Description',
    uiFilterType: EVENT_FILTERS.DESCRIPTION,
  },
  {
    columnId: 'eventCategory',
    apiPropertyName: 'WorldEventCategory.Name',
    uiFilterType: EVENT_FILTERS.EVENT_CATEGORY,
  },
  { columnId: 'eventType', apiPropertyName: 'WorldEventType.Name', uiFilterType: EVENT_FILTERS.EVENT_TYPE },
  { columnId: 'country', apiPropertyName: 'Countries.Name' },
  { columnId: 'cities', apiPropertyName: 'Cities.Name' },
  { columnId: 'region', apiPropertyName: 'Regions.Name' },
  { columnId: 'airports', apiPropertyName: 'WorldEventAirports.IcaoCode' },
  { columnId: 'eventSchedule.startDate', apiPropertyName: 'EventSchedule.StartDate' },
  { columnId: 'endDate', apiPropertyName: 'EndDate' },
  { columnId: 'status', apiPropertyName: 'Status.Name' },
  { columnId: 'uaOffice', apiPropertyName: 'WorldEventUAOffices.UAOffice.Name' },
];
