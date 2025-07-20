import { IAPIFilterDictionary } from '@wings-shared/core';
import { TEAM_FILTER } from '../Shared';

export const gridFilters: IAPIFilterDictionary<TEAM_FILTER>[] = [
  {
    columnId: 'name',
    apiPropertyName: 'Name',
    uiFilterType: TEAM_FILTER.NAME,
  },
  {
    columnId: 'code',
    apiPropertyName: 'Code',
    uiFilterType: TEAM_FILTER.CODE,
  },
  {
    columnId: 'managerName',
    apiPropertyName: 'ManagerName',
    uiFilterType: TEAM_FILTER.MANAGER_NAME,
  },
  {
    columnId: 'managerEmail',
    apiPropertyName: 'ManagerEmail',
    uiFilterType: TEAM_FILTER.MANAGER_EMAIL,
  },
  {
    columnId: 'groupEmail',
    apiPropertyName: 'GroupEmail',
    uiFilterType: TEAM_FILTER.GROUP_EMAIL,
  },
  {
    columnId: 'associatedTeamTypes',
    apiPropertyName: 'AssociatedTeamTypes.TeamType.Name',
    uiFilterType: TEAM_FILTER.ASSOCIATED_TEAM_TYPES,
  },
  {
    columnId: 'status',
    apiPropertyName: 'Status.Name',
    uiFilterType: TEAM_FILTER.STATUS,
  },
];
