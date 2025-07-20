import { IAPIFilterDictionary } from '@wings-shared/core';
import { SUPPLIER_FILTERS } from '../Shared';
import { baseGridFiltersDictionary } from '@wings/shared';

export const gridFilters: IAPIFilterDictionary<SUPPLIER_FILTERS>[] = [
  ...baseGridFiltersDictionary<SUPPLIER_FILTERS>(),
  {
    columnId: 'supplierType',
    apiPropertyName: 'SupplierType.Name',
    uiFilterType: SUPPLIER_FILTERS.TYPE,
  },
  {
    columnId: 'name',
    apiPropertyName: 'Name',
    uiFilterType: SUPPLIER_FILTERS.NAME,
  },
  {
    columnId: 'tollFreeNumber',
    apiPropertyName: 'TollFreeNumber',
    uiFilterType: SUPPLIER_FILTERS.TOLL_FREE_NUMBER,
  },
  {
    columnId: 'phoneNumber',
    apiPropertyName: 'PhoneNumber',
    uiFilterType: SUPPLIER_FILTERS.PHONE_NUMBER,
  },
  {
    columnId: 'faxNumber',
    apiPropertyName: 'FaxNumber',
    uiFilterType: SUPPLIER_FILTERS.FAX_NUMBER,
  },
  {
    columnId: 'webSite',
    apiPropertyName: 'WebSite',
    uiFilterType: SUPPLIER_FILTERS.WEB_SITE,
  },
  {
    columnId: 'emailAddress',
    apiPropertyName: 'EmailAddress',
    uiFilterType: SUPPLIER_FILTERS.EMAIL_ADDRESS,
  },
  {
    columnId: 'serviceLevel',
    apiPropertyName: 'ServiceLevel.Name',
    uiFilterType: SUPPLIER_FILTERS.SERVICE_LEVEL,
  },
];
