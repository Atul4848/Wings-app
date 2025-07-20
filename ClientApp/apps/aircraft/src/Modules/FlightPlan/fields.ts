import { baseGridFiltersDictionary } from '@wings/shared';
import { IAPIFilterDictionary } from '@wings-shared/core';
import { FLIGHT_PLAN_FILTERS } from '../Shared';

export const flightPlanGridFilters: IAPIFilterDictionary<FLIGHT_PLAN_FILTERS>[] = [
  ...baseGridFiltersDictionary<FLIGHT_PLAN_FILTERS>(),
  {
    columnId: 'format',
    apiPropertyName: 'Format',
    uiFilterType: FLIGHT_PLAN_FILTERS.FORMAT,
  },
  {
    columnId: 'flightPlanFormatStatus',
    apiPropertyName: 'FlightPlanFormatStatus.Name',
    uiFilterType: FLIGHT_PLAN_FILTERS.ASSIGNMENT,
  },
  {
    columnId: 'builtBy',
    apiPropertyName: 'BuiltBy',
    uiFilterType: FLIGHT_PLAN_FILTERS.BUILT_BY,
  },
  {
    columnId: 'contactForChanges',
    apiPropertyName: 'ContactForChanges',
    uiFilterType: FLIGHT_PLAN_FILTERS.CONTACT_FOR_CHANGES,
  },
  {
    columnId: 'notes',
    apiPropertyName: 'Notes',
    uiFilterType: FLIGHT_PLAN_FILTERS.NOTES,
  },
  {
    columnId: 'name',
    apiPropertyName: 'FlightPlanFormatAccounts.Name',
    uiFilterType: FLIGHT_PLAN_FILTERS.ACCOUNT_NAME,
  },
  {
    columnId: 'registriesName',
    apiPropertyName: 'FlightPlanFormatAccounts.FlightPlanFormatAccountRegistries.Name',
    uiFilterType: FLIGHT_PLAN_FILTERS.REGISTRY,
  },
  {
    columnId: 'accountNumber',
    apiPropertyName: 'FlightPlanFormatAccounts.AccountNumber',
    uiFilterType: FLIGHT_PLAN_FILTERS.ACCOUNT,
  },
  {
    columnId: 'lastUsedDate',
    apiPropertyName: 'LastUsedDate',
  },
];
