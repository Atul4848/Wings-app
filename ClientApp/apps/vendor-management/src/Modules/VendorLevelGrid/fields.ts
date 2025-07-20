import { baseGridFiltersDictionary } from '@wings/shared';
import {
  VMS_COMPARISON_TYPE,
  VENDOR_LEVEL_COMPARISON_FILTERS,
  VENDOR_LEVEL_DATA_FILTERS,
  VENDOR_USER_FILTERS,
} from '../Shared';
import { IAPIFilterDictionary, MERGE_STATUS } from '@wings-shared/core';

export const gridFilters: IAPIFilterDictionary<VENDOR_LEVEL_COMPARISON_FILTERS>[] = [
  {
    columnId: 'name',
    apiPropertyName: 'Name',
    uiFilterType: VENDOR_LEVEL_COMPARISON_FILTERS.VENDOR_NAME,
  },
  {
    columnId: 'code',
    apiPropertyName: 'Code',
    uiFilterType: VENDOR_LEVEL_COMPARISON_FILTERS.VENDOR_CODE,
  },
  {
    columnId: 'vendorStatus',
    apiPropertyName: 'VendorStatus.Name',
    uiFilterType: VENDOR_LEVEL_COMPARISON_FILTERS.VENDOR_STATUS,
  },
];

export const comparisonType = {
  [VMS_COMPARISON_TYPE.ADDED]: 'Added',
  [VMS_COMPARISON_TYPE.MODIFIED]: 'Modified',
  [VMS_COMPARISON_TYPE.DELETED]: 'Removed',
};

export const vendorImportDataFiltersMap = {
  [VENDOR_LEVEL_DATA_FILTERS.NAME]: null,
  [VENDOR_LEVEL_DATA_FILTERS.CODE]: 1,
  [VENDOR_LEVEL_DATA_FILTERS.STATUS]: 2,
};

export const gridVendorUser: IAPIFilterDictionary<VENDOR_USER_FILTERS>[] = [
  {
    columnId: 'email',
    apiPropertyName: 'email',
    uiFilterType: VENDOR_USER_FILTERS.FIRST_NAME,
  },
  {
    columnId: 'givenName',
    apiPropertyName: 'givenName',
    uiFilterType: VENDOR_USER_FILTERS.FIRST_NAME,
  },
  {
    columnId: 'surName',
    apiPropertyName: 'surName',
    uiFilterType: VENDOR_USER_FILTERS.LAST_NAME,
  },
  {
    columnId: 'phoneNo',
    apiPropertyName: 'phoneNo',
    uiFilterType: VENDOR_USER_FILTERS.PHONE,
  },
  {
    columnId: 'status',
    apiPropertyName: 'status',
    uiFilterType: VENDOR_USER_FILTERS.STATUS,
  },
  {
    columnId: 'userRole',
    apiPropertyName: 'userRole',
    uiFilterType: VENDOR_USER_FILTERS.ROLE,
  },
  {
    columnId: 'vendorUserLocation',
    apiPropertyName: 'vendorUserLocation',
    uiFilterType: VENDOR_USER_FILTERS.LOCATION,
  },
];
