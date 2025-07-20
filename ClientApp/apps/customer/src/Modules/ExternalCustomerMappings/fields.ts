import { IAPIFilterDictionary } from '@wings-shared/core';
import { EXTERNAL_CUSTOMER_MAPPING } from '../Shared';
import { baseGridFiltersDictionary } from '@wings/shared';

export const gridFilters: IAPIFilterDictionary<EXTERNAL_CUSTOMER_MAPPING>[] = [
  ...baseGridFiltersDictionary<EXTERNAL_CUSTOMER_MAPPING>(),
  {
    columnId: 'externalCustomerMappingLevel',
    apiPropertyName: 'ExternalCustomerMappingLevel.Name',
    uiFilterType: EXTERNAL_CUSTOMER_MAPPING.LEVEL,
  },
  {
    columnId: 'externalCustomerSource',
    apiPropertyName: 'ExternalCustomerSource.Name',
    uiFilterType: EXTERNAL_CUSTOMER_MAPPING.EXTERNAL_CUSTOMER_SOURCE,
  },
  {
    columnId: 'customer',
    apiPropertyName: 'Customer.Name',
    uiFilterType: EXTERNAL_CUSTOMER_MAPPING.CUSTOMER,
  },
  {
    columnId: 'customerAssociatedRegistries',
    apiPropertyName: 'CustomerAssociatedRegistries.Registry.Name',
    uiFilterType: EXTERNAL_CUSTOMER_MAPPING.REGISTRIES,
  },
  {
    columnId: 'customerAssociatedOffices',
    apiPropertyName: 'CustomerAssociatedOffices.AssociatedOfficeName',
    uiFilterType: EXTERNAL_CUSTOMER_MAPPING.OFFICES,
  },
  {
    columnId: 'customerAssociatedOperators',
    apiPropertyName: 'CustomerAssociatedOperators.Operator.Name',
    uiFilterType: EXTERNAL_CUSTOMER_MAPPING.OPERATORS,
  },
];
