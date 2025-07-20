import { AIP_FILTERS } from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const gridFilters: IAPIFilterDictionary<AIP_FILTERS>[] = [
  {
    columnId: 'aipLink',
    apiPropertyName: 'AIPLink',
    uiFilterType: AIP_FILTERS.LINK,
  },
  {
    columnId: 'description',
    apiPropertyName: 'Description',
    uiFilterType: AIP_FILTERS.DESCRIPTION,
  },
  {
    columnId: 'aipUsername',
    apiPropertyName: 'AIPUsername',
    uiFilterType: AIP_FILTERS.USER_NAME,
  },
  {
    columnId: 'aipSourceType',
    apiPropertyName: 'AIPSourceType.Name',
    uiFilterType: AIP_FILTERS.TYPE,
  },
];
