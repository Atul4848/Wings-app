import {
  VMS_COMPARISON_TYPE,
  VENDOR_PRICING_COMPARISON_FILTERS,
  VendorManagmentModel,
} from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core'

export const gridFilters: IAPIFilterDictionary<VENDOR_PRICING_COMPARISON_FILTERS>[] = [
  {
    columnId: 'vendor.name',
    apiPropertyName: 'Vendor.Name',
    uiFilterType: VENDOR_PRICING_COMPARISON_FILTERS.VENDOR_NAME,
  },
  {
    columnId: 'vendor.code',
    apiPropertyName: 'Vendor.Code',
    uiFilterType: VENDOR_PRICING_COMPARISON_FILTERS.VENDOR_CODE,
  },
  {
    columnId: 'vendorLocation.vendorLocationName',
    apiPropertyName: 'VendorLocation.VendorLocationName',
    uiFilterType: VENDOR_PRICING_COMPARISON_FILTERS.VENDOR_LOCATION_NAME,
  },
  {
    columnId: 'vendorLocation.AirportReference',
    apiPropertyName: 'VendorLocation.AirportReference.AirportCode',
    uiFilterType: VENDOR_PRICING_COMPARISON_FILTERS.AIRPORT_CODE,
  },
  {
    columnId: 'serviceItem.name',
    apiPropertyName: 'ServiceItem.Name',
    uiFilterType: VENDOR_PRICING_COMPARISON_FILTERS.SERVICE_NAME,
  },
  {
    columnId: 'parameter.name',
    apiPropertyName: 'Parameter.Name',
    uiFilterType: VENDOR_PRICING_COMPARISON_FILTERS.PARAMETER,
  },
  {
    columnId: 'currency.name',
    apiPropertyName: 'Currency.Name',
    uiFilterType: VENDOR_PRICING_COMPARISON_FILTERS.CURRENCY,
  },
  {
    columnId: 'uom.name',
    apiPropertyName: 'UOM.Name',
    uiFilterType: VENDOR_PRICING_COMPARISON_FILTERS.UNITS,
  },
  {
    columnId: 'status',
    apiPropertyName: 'Status.Name',
    uiFilterType: VENDOR_PRICING_COMPARISON_FILTERS.PRICING_STATUS,
  },
];

export const comparisonType = {
  [VMS_COMPARISON_TYPE.ADDED]: 'Added',
  [VMS_COMPARISON_TYPE.MODIFIED]: 'Modified',
  [VMS_COMPARISON_TYPE.DELETED]: 'Removed',
};

export const vendorImportDataFiltersMap = {
  [VENDOR_PRICING_COMPARISON_FILTERS.VENDOR_NAME]: null,
  [VENDOR_PRICING_COMPARISON_FILTERS.VENDOR_CODE]: 1,
  [VENDOR_PRICING_COMPARISON_FILTERS.VENDOR_LOCATION_NAME]: 2,
  [VENDOR_PRICING_COMPARISON_FILTERS.VENDOR_LOCATION_AIRPORTCODE]: 3,
  [VENDOR_PRICING_COMPARISON_FILTERS.SERVICE_NAME]: 4,
  [VENDOR_PRICING_COMPARISON_FILTERS.PARAMETER]: 5,
  [VENDOR_PRICING_COMPARISON_FILTERS.CURRENCY]: 6,
  [VENDOR_PRICING_COMPARISON_FILTERS.UNITS]: 7,
  [VENDOR_PRICING_COMPARISON_FILTERS.PRICING_STATUS]: 8,
};

export const vendorValueFormatter=(vendor:VendorManagmentModel)=>{
  if(vendor.id)
    return `${vendor?.name} (${vendor?.code})`;
  else
    return '';
}

