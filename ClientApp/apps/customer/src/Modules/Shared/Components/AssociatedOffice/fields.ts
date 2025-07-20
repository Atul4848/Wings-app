import { baseGridFiltersDictionary } from '@wings/shared';
import { IAPIFilterDictionary } from '@wings-shared/core';
import { OFFICE_FILTER } from '../../Enums';

export const gridFilters: IAPIFilterDictionary<OFFICE_FILTER>[] = [
  ...baseGridFiltersDictionary<OFFICE_FILTER>(),
  {
    columnId: 'name',
    apiPropertyName: 'Name',
  },
  {
    columnId: 'code',
    apiPropertyName: 'Code',
  },
];
