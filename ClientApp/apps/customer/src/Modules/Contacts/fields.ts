import { baseGridFiltersDictionary } from '@wings/shared';
import { CUSTOMER_CONTACT_FILTERS } from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const gridFilters: IAPIFilterDictionary<CUSTOMER_CONTACT_FILTERS>[] = [
  ...baseGridFiltersDictionary<CUSTOMER_CONTACT_FILTERS>(),
  {
    columnId: 'contact',
    apiPropertyName: 'ContactValue',
    uiFilterType: CUSTOMER_CONTACT_FILTERS.CONTACT,
  },
  {
    columnId: 'contactExtension',
    apiPropertyName: 'ContactExtension',
    uiFilterType: CUSTOMER_CONTACT_FILTERS.CONTACT_EXTENSION,
  },
  {
    columnId: 'contactName',
    apiPropertyName: 'ContactName',
    uiFilterType: CUSTOMER_CONTACT_FILTERS.CONTACT_NAME,
  },
  {
    columnId: 'contactMethod',
    apiPropertyName: 'ContactMethod.Name',
    uiFilterType: CUSTOMER_CONTACT_FILTERS.CONTACT_METHOD,
  },
  {
    columnId: 'contactType',
    apiPropertyName: 'ContactType.Name',
    uiFilterType: CUSTOMER_CONTACT_FILTERS.CONTACT_TYPE,
  },
];
