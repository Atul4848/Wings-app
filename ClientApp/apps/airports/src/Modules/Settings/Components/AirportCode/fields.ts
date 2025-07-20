import { AIRPORT_CODE_SETTING_FILTERS } from '../../../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const gridFilters: IAPIFilterDictionary<AIRPORT_CODE_SETTING_FILTERS>[] = [
  { columnId: 'code', apiPropertyName: 'Code', uiFilterType: AIRPORT_CODE_SETTING_FILTERS.CODE },
  { columnId: 'status', apiPropertyName: 'StatusName' },
  {
    columnId: 'modifiedBy',
    apiPropertyName: 'ModifiedBy',
  },
  {
    columnId: 'modifiedOn',
    apiPropertyName: 'ModifiedOn',
  },
  {
    columnId: 'createdBy',
    apiPropertyName: 'CreatedBy',
  },
  {
    columnId: 'createdOn',
    apiPropertyName: 'CreatedOn',
  },
];
