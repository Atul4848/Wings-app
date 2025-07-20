import { baseGridFiltersDictionary } from '@wings/shared';
import { IAPIFilterDictionary } from '@wings-shared/core';
import { SITE_FILTER } from '../../Enums';

export const gridFilters: IAPIFilterDictionary<SITE_FILTER>[] = [
  ...baseGridFiltersDictionary<SITE_FILTER>(),
  {
    columnId: 'site',
    apiPropertyName: 'Site',
  },
  {
    columnId: 'startDate',
    apiPropertyName: 'StartDate',
  },
  {
    columnId: 'endDate',
    apiPropertyName: 'EndDate',
  },
];
