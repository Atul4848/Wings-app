import { baseGridFiltersDictionary } from '@wings/shared';
import { OPERATOR_FILTER } from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const gridFilters: IAPIFilterDictionary<OPERATOR_FILTER>[] = [
  ...baseGridFiltersDictionary<OPERATOR_FILTER>(),
  {
    columnId: 'name',
    apiPropertyName: 'Name',
    uiFilterType: OPERATOR_FILTER.NAME,
  },
  {
    columnId: 'status',
    apiPropertyName: 'Status',
    uiFilterType: OPERATOR_FILTER.STATUS,
  },
  {
    columnId: 'accessLevel',
    apiPropertyName: 'AccessLevel',
    uiFilterType: OPERATOR_FILTER.ACCESS_LEVEL,
  },
  {
    columnId: 'sourceType',
    apiPropertyName: 'SourceType',
    uiFilterType: OPERATOR_FILTER.SOURCE_TYPE,
  },
];
