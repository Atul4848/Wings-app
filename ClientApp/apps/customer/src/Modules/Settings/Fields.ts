import { ISubCategorySetting } from '@wings/shared';
import { SETTING_CATEGORIES, SETTING_ID } from '../Shared';
import { SelectOption } from '@wings-shared/core';

export const categoryList: SelectOption[] = [
  new SelectOption({ name: 'General', value: SETTING_CATEGORIES.GENERAL }),
  new SelectOption({ name: 'Customer', value: SETTING_CATEGORIES.CUSTOMER }),
  new SelectOption({ name: 'Customer Comms', value: SETTING_CATEGORIES.CUSTOMER_COMMS }),
];

export const settingList: ISubCategorySetting[] = [
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'Access Level',
    settingId: SETTING_ID.ACCESS_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'Source Type',
    settingId: SETTING_ID.SOURCE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMER,
    settingLabel: 'Service Type',
    settingId: SETTING_ID.SERVICE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMER,
    settingLabel: 'Special Care Type',
    settingId: SETTING_ID.SPECIAL_CARE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMER,
    settingLabel: 'Special Care Type Level',
    settingId: SETTING_ID.SPECIAL_CARE_TYPE_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMER_COMMS,
    settingLabel: 'Contact Method',
    settingId: SETTING_ID.CONTACT_METHOD,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMER_COMMS,
    settingLabel: 'Contact Type',
    settingId: SETTING_ID.CONTACT_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMER_COMMS,
    settingLabel: 'Communication Categories',
    settingId: SETTING_ID.COMMUNICATION_CATEGORIES,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMER_COMMS,
    settingLabel: 'Contact Role',
    settingId: SETTING_ID.CONTACT_ROLE,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMER_COMMS,
    settingLabel: 'Communication Level',
    settingId: SETTING_ID.COMMUNICATION_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMER_COMMS,
    settingLabel: 'Priority',
    settingId: SETTING_ID.PRIORITY,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMER,
    settingLabel: 'Note Type',
    settingId: SETTING_ID.NOTE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMER,
    settingLabel: 'Passport Nationality',
    settingId: SETTING_ID.PASSPORT_NATIONALITY,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMER,
    settingLabel: 'External Customer Mapping Level',
    settingId: SETTING_ID.MAPPING_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMER,
    settingLabel: 'External Customer Source',
    settingId: SETTING_ID.EXTERNAL_ACCOUNT,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMER,
    settingLabel: 'Team Use Type',
    settingId: SETTING_ID.TEAM_USE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMER,
    settingLabel: 'Team Type',
    settingId: SETTING_ID.TEAM_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMER,
    settingLabel: 'Profile Topic',
    settingId: SETTING_ID.PROFILE_TOPIC,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMER,
    settingLabel: 'Profile Level',
    settingId: SETTING_ID.PROFILE_LEVEL,
  },
];
