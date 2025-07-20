import { IAPIFilterDictionary } from '@wings-shared/core';
import { AIRPORT_DATA_EXPORT } from '../Shared';
import { baseGridFiltersDictionary } from '@wings/shared';

export const gridFilters: IAPIFilterDictionary<AIRPORT_DATA_EXPORT>[] = [
  ...baseGridFiltersDictionary<AIRPORT_DATA_EXPORT>(),
  {
    columnId: 'id',
    apiPropertyName: 'Id',
  },
  {
    columnId: 'startDate',
    apiPropertyName: 'StartDate',
  },
  {
    columnId: 'endDate',
    apiPropertyName: 'EndDate',
  },
  {
    columnId: 'airportDataExportRequestStatus',
    apiPropertyName: 'AirportDataExportRequestStatus.Name',
  },
];
