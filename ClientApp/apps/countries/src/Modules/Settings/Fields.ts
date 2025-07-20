import { ISubCategorySetting } from '@wings/shared';
import { SETTING_CATEGORIES, SETTING_ID } from '../Shared';
import { SelectOption } from '@wings-shared/core';

export const categoryList: SelectOption[] = [
  new SelectOption({ name: 'General', value: SETTING_CATEGORIES.GENERAL }),
  new SelectOption({ name: 'Bulletin', value: SETTING_CATEGORIES.BULLETIN }),
  new SelectOption({ name: 'Operational Requirements', value: SETTING_CATEGORIES.OPERATIONAL_REQUIREMENTS })
];

export const settingList: ISubCategorySetting[] = [
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'Territory Types',
    settingId: SETTING_ID.TERRITORY_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'Fee Requirements',
    settingId: SETTING_ID.FEE_REQUIREMENT,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'CAPPS Territory Types',
    settingId: SETTING_ID.CAPPS_TERRITORY_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'Region Types',
    settingId: SETTING_ID.REGION_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'State Types',
    settingId: SETTING_ID.STATE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'Security Threat Levels',
    settingId: SETTING_ID.SECURITY_THREAT_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'AIP Source Types',
    settingId: SETTING_ID.AIP_SOURCE_TYPE,
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
    categoryId: SETTING_CATEGORIES.OPERATIONAL_REQUIREMENTS,
    settingLabel: 'Navigator Flight Type',
    settingId: SETTING_ID.NAVIGATOR_FLIGHT_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.BULLETIN,
    settingLabel: 'Bulletin Levels',
    settingId: SETTING_ID.BULLETIN_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.BULLETIN,
    settingLabel: 'Bulletin Types',
    settingId: SETTING_ID.BULLETIN_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.BULLETIN,
    settingLabel: 'Bulletin Sources',
    settingId: SETTING_ID.BULLETIN_SOURCE,
  },
  {
    categoryId: SETTING_CATEGORIES.BULLETIN,
    settingLabel: 'Bulletin Priorities',
    settingId: SETTING_ID.BULLETIN_PRIORITY,
  },
  {
    categoryId: SETTING_CATEGORIES.OPERATIONAL_REQUIREMENTS,
    settingLabel: 'Cabotage Exemption Level',
    settingId: SETTING_ID.CABOTAGE_EXEMPTION_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.OPERATIONAL_REQUIREMENTS,
    settingLabel: 'Disinsection Types',
    settingId: SETTING_ID.DISINSECTION_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.OPERATIONAL_REQUIREMENTS,
    settingLabel: 'NavBlue Country Mapping',
    settingId: SETTING_ID.NAVBLUE_COUNTRY_MAPPING,
  },
  {
    categoryId: SETTING_CATEGORIES.OPERATIONAL_REQUIREMENTS,
    settingLabel: 'Disinsection Chemicals',
    settingId: SETTING_ID.DISINSECTION_CHEMICAL,
  },
  {
    categoryId: SETTING_CATEGORIES.OPERATIONAL_REQUIREMENTS,
    settingLabel: 'APIS Requirement',
    settingId: SETTING_ID.APIS_REQUIREMENT,
  },
  {
    categoryId: SETTING_CATEGORIES.OPERATIONAL_REQUIREMENTS,
    settingLabel: 'Requirement Type',
    settingId: SETTING_ID.REQUIREMENT_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.OPERATIONAL_REQUIREMENTS,
    settingLabel: 'Declaration for Cash Currency',
    settingId: SETTING_ID.DECLARATION_FOR_CASH_CURRENCY,
  },
  {
    categoryId: SETTING_CATEGORIES.OPERATIONAL_REQUIREMENTS,
    settingLabel: 'APIS Submission',
    settingId: SETTING_ID.APIS_SUBMISSION,
  },
  {
    categoryId: SETTING_CATEGORIES.OPERATIONAL_REQUIREMENTS,
    settingLabel: 'Weapon Information',
    settingId: SETTING_ID.WEAPON_INFORMATION,
  },
  {
    categoryId: SETTING_CATEGORIES.OPERATIONAL_REQUIREMENTS,
    settingLabel: 'Items 18 Contents',
    settingId: SETTING_ID.ITEMS_18_CONTENTS,
  },
  {
    categoryId: SETTING_CATEGORIES.OPERATIONAL_REQUIREMENTS,
    settingLabel: 'Aircraft Equipment',
    settingId: SETTING_ID.AIRCRAFT_EQUIPMENT,
  },
  {
    categoryId: SETTING_CATEGORIES.BULLETIN,
    settingLabel: 'Capps Category Code',
    settingId: SETTING_ID.CAPPS_CATEGORY_CODE,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'FAOC Applicable',
    settingId: SETTING_ID.FAOC_APPLICABLE,
  },
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'Expiration',
    settingId: SETTING_ID.EXPIRATION,
  },
];
