
import { IAPIFilterDictionary } from '@wings-shared/core';
import { DOCUMENT_FILTER } from '../../../Shared';

export const gridFilters: IAPIFilterDictionary<DOCUMENT_FILTER>[] = [
  {
    columnId: 'code',
    apiPropertyName: 'Code',
    uiFilterType: DOCUMENT_FILTER.CODE,
  },
  {
    columnId: 'name',
    apiPropertyName: 'Name',
    uiFilterType: DOCUMENT_FILTER.NAME,
  },
];
