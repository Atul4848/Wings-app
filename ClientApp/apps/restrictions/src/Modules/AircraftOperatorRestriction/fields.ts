import { baseGridFiltersDictionary } from '@wings/shared';
import { AIRCRAFT_OPERATOR_RESTRICTIONS } from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const gridFilters: IAPIFilterDictionary<AIRCRAFT_OPERATOR_RESTRICTIONS>[] = [
  ...baseGridFiltersDictionary<AIRCRAFT_OPERATOR_RESTRICTIONS>(),
  {
    columnId: 'effectedEntityType',
    apiPropertyName: 'EffectedEntityType.Name',
    uiFilterType: AIRCRAFT_OPERATOR_RESTRICTIONS.EFFECTED_ENTITY_TYPE,
  },
  {
    columnId: 'effectedEntity',
    apiPropertyName: 'EffectedEntity.Name',
    uiFilterType: AIRCRAFT_OPERATOR_RESTRICTIONS.EFFECTED_ENTITY,
  },
  {
    columnId: 'restrictionType',
    apiPropertyName: 'AircraftOperatorRestrictionType.Name',
    uiFilterType: AIRCRAFT_OPERATOR_RESTRICTIONS.RESTRICTION_TYPE,
  },
  {
    columnId: 'restrictingCountry',
    apiPropertyName: 'RestrictingCountry.Name',
    uiFilterType: AIRCRAFT_OPERATOR_RESTRICTIONS.RESTRICTING_COUNTRY,
  },
  {
    columnId: 'restrictionSeverity',
    apiPropertyName: 'RestrictionSeverity.Name',
    uiFilterType: AIRCRAFT_OPERATOR_RESTRICTIONS.RESTRICTION_SEVERITY,
  },
  {
    columnId: 'approvalTypeRequired',
    apiPropertyName: 'ApprovalTypeRequired.Name',
    uiFilterType: AIRCRAFT_OPERATOR_RESTRICTIONS.APPROVAL_TYPE_REQUIRED,
  },
  {
    columnId: 'uwaAllowableActions',
    apiPropertyName: 'UWAAllowableAction.Name',
    uiFilterType: AIRCRAFT_OPERATOR_RESTRICTIONS.UWA_ALLOWABLE_ACTIONS,
  },
  {
    columnId: 'nationalities',
    apiPropertyName: 'Nationalities.Code',
  },
  { columnId: 'startDate', apiPropertyName: 'StartDate' },
  { columnId: 'endDate', apiPropertyName: 'EndDate' },
];
