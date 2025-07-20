import { baseGridFiltersDictionary } from '@wings/shared';
import { CUSTOMER_FILTER } from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

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
    uiFilterType: CUSTOMER_FILTER.NUMBER,
  },
  {
    columnId: 'status',
    apiPropertyName: 'Status',
    uiFilterType: CUSTOMER_FILTER.STATUS,
  },
  {
    columnId: 'accessLevel',
    apiPropertyName: 'AccessLevel',
    uiFilterType: CUSTOMER_FILTER.ACCESS_LEVEL,
  },
  {
    columnId: 'sourceType',
    apiPropertyName: 'SourceType',
    uiFilterType: CUSTOMER_FILTER.SOURCE_TYPE,
  },
];
