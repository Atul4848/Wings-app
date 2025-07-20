import { ISubCategorySetting } from '@wings/shared';
import { SETTING_CATEGORIES, SETTING_ID } from '../Shared';
import { SelectOption } from '@wings-shared/core';

export const categoryList: SelectOption[] = [
  new SelectOption({ name: 'General', value: SETTING_CATEGORIES.GENERAL }),
];

export const settingList: ISubCategorySetting[] = [
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'World Event Type',
    settingId: SETTING_ID.WORLD_EVENT_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'World Aware',
    settingId: SETTING_ID.WORLD_AWARE,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'Source Types',
    settingId: SETTING_ID.SOURCE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'Access Levels',
    settingId: SETTING_ID.ACCESS_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'UA Offices',
    settingId: SETTING_ID.UA_OFFICE,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'World Event Category',
    settingId: SETTING_ID.WORLD_EVENT_CATEGORY,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'Special Consideration',
    settingId: SETTING_ID.SPECIAL_CONSIDERATION,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'Supplier Type',
    settingId: SETTING_ID.SUPPLIER_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'Service Level',
    settingId: SETTING_ID.SERVICE_LEVEL,
  },
];
