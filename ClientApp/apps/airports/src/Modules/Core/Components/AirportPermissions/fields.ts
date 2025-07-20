import { baseGridFiltersDictionary } from '@wings/shared';
import { PERMISSION_FILTERS } from '../../../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const gridFilters: IAPIFilterDictionary<PERMISSION_FILTERS>[] = [
  ...baseGridFiltersDictionary<PERMISSION_FILTERS>(),
  {
    columnId: 'permissionType',
    apiPropertyName: 'PermissionType.Name',
    uiFilterType: PERMISSION_FILTERS.PERMISSION_TYPE,
  },
  {
    columnId: 'notificationType',
    apiPropertyName: 'NotificationType.Name',
    uiFilterType: PERMISSION_FILTERS.NOTIFICATION_TYPE,
  },
  {
    columnId: 'permissionRequiredFors',
    apiPropertyName: 'PermissionRequiredFors.Name',
    uiFilterType: PERMISSION_FILTERS.REQUIRED_FOR,
  },
  {
    columnId: 'pprPurposes',
    apiPropertyName: 'PPRPurposes.Name',
    uiFilterType: PERMISSION_FILTERS.PPR_PURPOSE,
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
    columnId: 'documents',
    apiPropertyName: 'Documents.Name',
    uiFilterType: PERMISSION_FILTERS.DOCUMENT,
  },
];
