import { IAPIFilterDictionary } from '@wings-shared/core';
import { CUSTOMER_PROFILE } from '../../../Shared';
import { baseGridFiltersDictionary } from '@wings/shared';

export const gridFilters: IAPIFilterDictionary<CUSTOMER_PROFILE>[] = [
  ...baseGridFiltersDictionary<CUSTOMER_PROFILE>(),
  {
    columnId: 'customerProfileLevel',
    apiPropertyName: 'CustomerProfileLevel.Name',
    uiFilterType: CUSTOMER_PROFILE.LEVEL,
  },
  {
    columnId: 'profileTopic',
    apiPropertyName: 'ProfileTopic.Name',
    uiFilterType: CUSTOMER_PROFILE.TOPIC,
  },
  {
    columnId: 'text',
    apiPropertyName: 'Text',
    uiFilterType: CUSTOMER_PROFILE.TEXT,
  },
  {
    columnId: 'entities',
    apiPropertyName: 'Entities.EntityName',
    uiFilterType: CUSTOMER_PROFILE.ENTITY,
  },
];
