import { baseGridFiltersDictionary } from '@wings/shared';
import { REGISTRY_FILTER } from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const gridFilters: IAPIFilterDictionary<REGISTRY_FILTER>[] = [
  ...baseGridFiltersDictionary<REGISTRY_FILTER>(),
  {
    columnId: 'name',
    apiPropertyName: 'Name',
    uiFilterType: REGISTRY_FILTER.NAME,
  },
  {
    columnId: 'status',
    apiPropertyName: 'Status',
    uiFilterType: REGISTRY_FILTER.STATUS,
  },
  {
    columnId: 'accessLevel',
    apiPropertyName: 'AccessLevel',
    uiFilterType: REGISTRY_FILTER.ACCESS_LEVEL,
  },
  {
    columnId: 'sourceType',
    apiPropertyName: 'SourceType',
    uiFilterType: REGISTRY_FILTER.SOURCE_TYPE,
  },
];
