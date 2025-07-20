import { IAPIFilterDictionary } from '@wings-shared/core';
import { TEAM_MEMBER_FILTER } from '../Shared';
import { baseGridFiltersDictionary } from '@wings/shared';

export const gridFilters: IAPIFilterDictionary<TEAM_MEMBER_FILTER>[] = [
  ...baseGridFiltersDictionary<TEAM_MEMBER_FILTER>(),
  {
    columnId: 'person',
    apiPropertyName: 'Person.FirstName',
    uiFilterType: TEAM_MEMBER_FILTER.PERSON,
  },
  {
    columnId: 'extension',
    apiPropertyName: 'Extension',
    uiFilterType: TEAM_MEMBER_FILTER.EXTENSION,
  },
  {
    columnId: 'companyCell',
    apiPropertyName: 'CompanyCell',
    uiFilterType: TEAM_MEMBER_FILTER.COMPANY_CELL,
  },
];
