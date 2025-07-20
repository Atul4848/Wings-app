import { baseGridFiltersDictionary } from '@wings/shared';
import { CUSTOMER_COMMUNICATION_FILTERS } from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const gridFilters: IAPIFilterDictionary<CUSTOMER_COMMUNICATION_FILTERS>[] = [
  ...baseGridFiltersDictionary<CUSTOMER_COMMUNICATION_FILTERS>(),
  {
    columnId: 'communicationLevel',
    apiPropertyName: 'CommunicationLevel.Name',
    uiFilterType: CUSTOMER_COMMUNICATION_FILTERS.COMMUNICATION_LEVEL,
  },
  {
    columnId: 'contactRole',
    apiPropertyName: 'ContactRole.Name',
    uiFilterType: CUSTOMER_COMMUNICATION_FILTERS.CONTACT_ROLE,
  },
  {
    columnId: 'customer',
    apiPropertyName: 'Customer.Name',
    uiFilterType: CUSTOMER_COMMUNICATION_FILTERS.CUSTOMER,
  },
  {
    columnId: 'customer',
    apiPropertyName: 'Customer.Number',
    uiFilterType: CUSTOMER_COMMUNICATION_FILTERS.CUSTOMER_NUMBER,
  },
  {
    columnId: 'contact',
    apiPropertyName: 'ContactValue',
    uiFilterType: CUSTOMER_COMMUNICATION_FILTERS.CONTACT,
  },
  {
    columnId: 'contactExtension',
    apiPropertyName: 'ContactExtension',
    uiFilterType: CUSTOMER_COMMUNICATION_FILTERS.CONTACT_EXTENSION,
  },
  {
    columnId: 'contactName',
    apiPropertyName: 'ContactName',
    uiFilterType: CUSTOMER_COMMUNICATION_FILTERS.CONTACT_NAME,
  },
  {
    columnId: 'contactMethod',
    apiPropertyName: 'ContactMethod.Name',
    uiFilterType: CUSTOMER_COMMUNICATION_FILTERS.CONTACT_METHOD,
  },
  {
    columnId: 'contactType',
    apiPropertyName: 'ContactType.Name',
    uiFilterType: CUSTOMER_COMMUNICATION_FILTERS.CONTACT_TYPE,
  },
  {
    columnId: 'startDate',
    apiPropertyName: 'StartDate',
  },
  {
    columnId: 'endDate',
    apiPropertyName: 'EndDate',
  },
  {
    columnId: 'communicationCategories',
    apiPropertyName: 'CommunicationCategories',
  },
  {
    columnId: 'offices',
    apiPropertyName: 'CustomerCommunicationAssociatedOffices',
  },
  {
    columnId: 'sequence',
    apiPropertyName: 'Sequence',
  },
  {
    columnId: 'sequence',
    apiPropertyName: 'Sequence',
  },
  {
    columnId: 'sites',
    apiPropertyName: 'CustomerCommunicationAssociatedSites',
  },
  {
    columnId: 'contactPriority',
    apiPropertyName: 'ContactPriority',
  },
  {
    columnId: 'operators',
    apiPropertyName: 'CustomerCommunicationAssociatedOperators',
  },
  {
    columnId: 'registries',
    apiPropertyName: 'CustomerCommunicationAssociatedRegistries',
  },
  {
    columnId: 'contactValue',
    apiPropertyName: 'ContactValue',
  },
  {
    columnId: 'contactExtension',
    apiPropertyName: 'ContactExtension',
  },
];
