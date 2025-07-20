import { ISubCategorySetting } from '@wings/shared';
import { SETTING_CATEGORIES, SETTING_ID } from '../Shared';
import { SelectOption } from '@wings-shared/core';

export const categoryList: SelectOption[] = [
  new SelectOption({ name: 'General', value: SETTING_CATEGORIES.GENERAL }),
  new SelectOption({ name: 'Permit Rules', value: SETTING_CATEGORIES.PERMIT_RULES }),
  new SelectOption({ name: 'Permit', value: SETTING_CATEGORIES.PERMIT }),
];

export const settingList: ISubCategorySetting[] = [
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
    categoryId: SETTING_CATEGORIES.PERMIT_RULES,
    settingLabel: 'Rule Conditional Operator',
    settingId: SETTING_ID.RULE_CONDITIONAL_OPERATOR,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT_RULES,
    settingLabel: 'Rule Entity',
    settingId: SETTING_ID.RULE_ENTITY,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Blanket Validity',
    settingId: SETTING_ID.BLANKET_VALIDITY,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Document',
    settingId: SETTING_ID.DOCUMENT,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Diplomatic Channel Required',
    settingId: SETTING_ID.DIPLOMATIC_CHANNEL_REQUIRED,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Elements',
    settingId: SETTING_ID.ELEMENTS,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'FAR Type',
    settingId: SETTING_ID.FAR_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Rejection Reason',
    settingId: SETTING_ID.REJECTION_REASON,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Flight Operational Category',
    settingId: SETTING_ID.FLIGHT_OPERATIONAL_CATEGORY,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Lead Time Type',
    settingId: SETTING_ID.LEAD_TIME_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Permit Type',
    settingId: SETTING_ID.PERMIT_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Permit Applied To',
    settingId: SETTING_ID.PERMIT_APPLIED_TO,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Permit Number Exceptions',
    settingId: SETTING_ID.PERMIT_NUMBER_EXCEPTIONS,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Permit Prerequisites',
    settingId: SETTING_ID.PERMIT_PREREQUISITES,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Permit Requirement Type',
    settingId: SETTING_ID.PERMIT_REQUIREMENT_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Purpose of Flight',
    settingId: SETTING_ID.PURPOSE_OF_FLIGHT,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Time Level UOM',
    settingId: SETTING_ID.TIME_LEVEL_UOM,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Mission Element',
    settingId: SETTING_ID.MISSION_ELEMENT,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Data Element',
    settingId: SETTING_ID.DATA_ELEMENT,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Crossing Type',
    settingId: SETTING_ID.CROSSING_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Permit Classification',
    settingId: SETTING_ID.PERMIT_CLASSIFICATION,
  },
  {
    categoryId: SETTING_CATEGORIES.PERMIT,
    settingLabel: 'Preset Validity',
    settingId: SETTING_ID.PRESET_VALIDITY,
  },
];
