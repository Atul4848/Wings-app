import { ISubCategorySetting } from '@wings/shared';
import { SETTING_CATEGORIES, SETTING_ID } from '../Shared';
import { SelectOption } from '@wings-shared/core';

export const categoryList: SelectOption[] = [
  new SelectOption({ name: 'Aircraft Operator', value: SETTING_CATEGORIES.AIRCRAFT_OPERATOR }),
  new SelectOption({ name: 'General', value: SETTING_CATEGORIES.GENERAL }),
  new SelectOption({ name: 'Health Data', value: SETTING_CATEGORIES.HEALTH_DATA }),
  new SelectOption({ name: 'Restrictions', value: SETTING_CATEGORIES.RESTRICTION }),
];

export const settingList: ISubCategorySetting[] = [
  {
    categoryId: SETTING_CATEGORIES.RESTRICTION,
    settingLabel: 'UWA Allowable Actions',
    settingId: SETTING_ID.UWA_ALLOWABLE_ACTION,
  },
  {
    categoryId: SETTING_CATEGORIES.RESTRICTION,
    settingLabel: 'UWA Allowable Services',
    settingId: SETTING_ID.UWA_ALLOWABLE_SERVICE,
  },
  {
    categoryId: SETTING_CATEGORIES.RESTRICTION,
    settingLabel: 'Landing or Overflights',
    settingId: SETTING_ID.LANDING_OR_OVERFLIGHT,
  },
  {
    categoryId: SETTING_CATEGORIES.RESTRICTION,
    settingLabel: 'Approval Types',
    settingId: SETTING_ID.APPROVAL_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.RESTRICTION,
    settingLabel: 'Restriction Applies',
    settingId: SETTING_ID.RESTRICTION_APPLIES,
  },
  {
    categoryId: SETTING_CATEGORIES.RESTRICTION,
    settingLabel: 'Restriction Levels',
    settingId: SETTING_ID.RESTRICTION_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.RESTRICTION,
    settingLabel: 'Restriction Sources',
    settingId: SETTING_ID.RESTRICTION_SOURCE,
  },
  {
    categoryId: SETTING_CATEGORIES.RESTRICTION,
    settingLabel: 'Restriction Types',
    settingId: SETTING_ID.RESTRICTION_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'Access Levels',
    settingId: SETTING_ID.ACCESS_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'Source Types',
    settingId: SETTING_ID.SOURCE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Authorization Levels',
    settingId: SETTING_ID.AUTHORIZATION_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Infection Types',
    settingId: SETTING_ID.INFECTION_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Affected Types',
    settingId: SETTING_ID.AFFECTED_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Quarantine Locations',
    settingId: SETTING_ID.QUARANTINE_LOCATION,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Test Types',
    settingId: SETTING_ID.TEST_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Health Forms',
    settingId: SETTING_ID.HEALTH_FORM,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Lead Time Indicators',
    settingId: SETTING_ID.LEAD_TIME_INDICATOR,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Contact Level',
    settingId: SETTING_ID.CONTACT_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'Status',
    settingId: SETTING_ID.STATUS,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Flights Allowed',
    settingId: SETTING_ID.FLIGHTS_ALLOWED,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Who Can Leave Aircraft',
    settingId: SETTING_ID.WHO_CAN_LEAVE_AIRCRAFT,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Vaccination Privilege',
    settingId: SETTING_ID.VACCINATION_PRIVILEGE,
  },
  {
    categoryId: SETTING_CATEGORIES.RESTRICTION,
    settingLabel: 'Overflight Levels',
    settingId: SETTING_ID.OVERFLIGHT_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Vaccine Manufacturer',
    settingId: SETTING_ID.VACCINE_MANUFACTURER,
  },
  {
    categoryId: SETTING_CATEGORIES.RESTRICTION,
    settingLabel: 'Arrival Levels',
    settingId: SETTING_ID.ARRIVAL_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Boarding Type',
    settingId: SETTING_ID.BOARDING_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.RESTRICTION,
    settingLabel: 'Departure Levels',
    settingId: SETTING_ID.DEPARTURE_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Stay Length Category',
    settingId: SETTING_ID.STAY_LENGTH_CATEGORY,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Curfew Hour Type',
    settingId: SETTING_ID.CURFEW_HOUR_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'PPE Type',
    settingId: SETTING_ID.PPE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Id Type',
    settingId: SETTING_ID.ID_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRCRAFT_OPERATOR,
    settingLabel: 'Aircraft Operator Restriction Types',
    settingId: SETTING_ID.AIRCRAFT_OPERATOR_RESTRICTION_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRCRAFT_OPERATOR,
    settingLabel: 'Effected Entity Types',
    settingId: SETTING_ID.EFFECTED_ENTITY_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRCRAFT_OPERATOR,
    settingLabel: 'Enforcement Agencies',
    settingId: SETTING_ID.ENFORCEMENT_AGENCY,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRCRAFT_OPERATOR,
    settingLabel: 'Restriction Severity',
    settingId: SETTING_ID.RESTRICTION_SEVERITY,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRCRAFT_OPERATOR,
    settingLabel: 'Approval Type Required',
    settingId: SETTING_ID.APPROVAL_TYPE_REQUIRED,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRCRAFT_OPERATOR,
    settingLabel: 'Required Documents/Forms',
    settingId: SETTING_ID.RESTRICTION_FORM,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Traveled History Category',
    settingId: SETTING_ID.TRAVELED_HISTORY_CATEGORY,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Traveled History Sub Category',
    settingId: SETTING_ID.TRAVELED_HISTORY_SUB_CATEGORY,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Traveller Type',
    settingId: SETTING_ID.TRAVELLER_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.HEALTH_DATA,
    settingLabel: 'Vaccination Status',
    settingId: SETTING_ID.VACCINATION_STATUS,
  },
];
