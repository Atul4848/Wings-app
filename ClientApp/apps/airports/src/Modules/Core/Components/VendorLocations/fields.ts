import { IAPIFilterDictionary } from '@wings-shared/core';
import { VENDOR_LOCATION_FILTERS } from '../../../Shared';

export const gridFilters: IAPIFilterDictionary<VENDOR_LOCATION_FILTERS>[] = [
  {
    columnId: 'vendor.vendorName',
    apiPropertyName: 'Vendor.Name',
    uiFilterType: VENDOR_LOCATION_FILTERS.VENDOR_NAME,
  },
  {
    columnId: 'vendor.vendorCode',
    apiPropertyName: 'Vendor.Code',
    uiFilterType: VENDOR_LOCATION_FILTERS.VENDOR_CODE,
  },
  {
    columnId: 'locationName',
    apiPropertyName: 'Name',
    uiFilterType: VENDOR_LOCATION_FILTERS.LOCATION_NAME,
  },
  {
    columnId: 'locationCode',
    apiPropertyName: 'Code',
    uiFilterType: VENDOR_LOCATION_FILTERS.LOCATION_CODE,
  },
  {
    columnId: 'locationStatus',
    apiPropertyName: 'VendorLocationStatus.Name',
    uiFilterType: VENDOR_LOCATION_FILTERS.LOCATION_STATUS,
  },
];