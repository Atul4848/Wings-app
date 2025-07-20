import {
  VMS_COMPARISON_TYPE,
  DIRECTORY_CODE_DATA_FILTERS,
  VendorManagmentModel,
  VENDOR_CONTACT_COMPARISON_FILTERS,
} from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core'

export const gridFilters: IAPIFilterDictionary<DIRECTORY_CODE_DATA_FILTERS>[] = [
  {
    columnId: 'contact',
    apiPropertyName: 'Contact',
    uiFilterType: DIRECTORY_CODE_DATA_FILTERS.CONTACT,
  },
  {
    columnId: 'code',
    apiPropertyName: 'Code',
    uiFilterType: DIRECTORY_CODE_DATA_FILTERS.CODE,
  },
];

export const comparisonType = {
  [VMS_COMPARISON_TYPE.ADDED]: 'Added',
  [VMS_COMPARISON_TYPE.MODIFIED]: 'Modified',
  [VMS_COMPARISON_TYPE.DELETED]: 'Removed',
};

export const directoryCodeFiltersMap = {
  [DIRECTORY_CODE_DATA_FILTERS.CONTACT]: 1,
  [DIRECTORY_CODE_DATA_FILTERS.CODE]: 2,
};

