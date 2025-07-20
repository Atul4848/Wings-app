import { baseGridFiltersDictionary } from '@wings/shared';
import { IAPIFilterDictionary } from '@wings-shared/core';
import { CUSTOMER_FILTER } from '../../Enums';

export const gridFilters: IAPIFilterDictionary<CUSTOMER_FILTER>[] = [
  ...baseGridFiltersDictionary<CUSTOMER_FILTER>(),
  {
    columnId: 'name',
    apiPropertyName: 'Name',
    uiFilterType: CUSTOMER_FILTER.NAME,
  },
  {
    columnId: 'number',
    apiPropertyName: 'Number',
  },
];
