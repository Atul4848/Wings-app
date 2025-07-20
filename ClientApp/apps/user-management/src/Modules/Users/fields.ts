
import { IAPIFilterDictionary } from '@wings-shared/core';
import { LOGS_FILTERS } from '../Shared/Enums';

export const gridFilters: IAPIFilterDictionary<LOGS_FILTERS>[] = [
  {
    columnId: 'fullName',
    apiPropertyName: 'Name',
  },
  {
    columnId: 'username',
    apiPropertyName: 'Username',
  },
  {
    columnId: 'csdUsername',
    apiPropertyName: 'UVGOProfile.CSDUsername',
  },
  {
    columnId: 'status',
    apiPropertyName: 'Status',
  },
];
