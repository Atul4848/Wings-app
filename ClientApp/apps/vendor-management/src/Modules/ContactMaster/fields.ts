import {
  VMS_COMPARISON_TYPE,
  VENDOR_CONTACT_COMPARISON_FILTERS,
  VendorManagmentModel,
} from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core'

export const gridFilters: IAPIFilterDictionary<VENDOR_CONTACT_COMPARISON_FILTERS>[] = [
  {
    columnId: 'contactMethod',
    apiPropertyName: 'ContactMethod.Name',
    uiFilterType: VENDOR_CONTACT_COMPARISON_FILTERS.CONTACT_METHOD,
  },
  {
    columnId: 'contact',
    apiPropertyName: 'Contact',
    uiFilterType: VENDOR_CONTACT_COMPARISON_FILTERS.CONTACT,
  },
  {
    columnId: 'contactType',
    apiPropertyName: 'ContactType.Name',
    uiFilterType: VENDOR_CONTACT_COMPARISON_FILTERS.CONTACT_TYPE,
  },
  {
    columnId: 'contactName',
    apiPropertyName: 'ContactName',
    uiFilterType: VENDOR_CONTACT_COMPARISON_FILTERS.CONTACT_NAME,
  },
  {
    columnId: 'title',
    apiPropertyName: 'Title',
    uiFilterType: VENDOR_CONTACT_COMPARISON_FILTERS.TITLE,
  },
  {
    columnId: 'status',
    apiPropertyName: 'Status.Name',
    uiFilterType: VENDOR_CONTACT_COMPARISON_FILTERS.CONTACT_STATUS,
  },
  {
    columnId: 'accessLevel',
    apiPropertyName: 'AccessLevel.Name',
    uiFilterType: VENDOR_CONTACT_COMPARISON_FILTERS.CONTACT_ACCESS_LEVEL,
  },
];

export const comparisonType = {
  [VMS_COMPARISON_TYPE.ADDED]: 'Added',
  [VMS_COMPARISON_TYPE.MODIFIED]: 'Modified',
  [VMS_COMPARISON_TYPE.DELETED]: 'Removed',
};

export const vendorImportDataFiltersMap = {
  [VENDOR_CONTACT_COMPARISON_FILTERS.CONTACT_METHOD]: null,
  [VENDOR_CONTACT_COMPARISON_FILTERS.CONTACT_TYPE]: 1,
  [VENDOR_CONTACT_COMPARISON_FILTERS.CONTACT_STATUS]: 2,
  [VENDOR_CONTACT_COMPARISON_FILTERS.CONTACT_ACCESS_LEVEL]: 8,
};

