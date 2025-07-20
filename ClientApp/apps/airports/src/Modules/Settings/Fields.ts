import { ISubCategorySetting } from '@wings/shared';
import { SETTING_CATEGORIES, SETTING_ID } from '../Shared';
import { SelectOption } from '@wings-shared/core';

export const categoryList: SelectOption[] = [
  new SelectOption({ name: 'General', value: SETTING_CATEGORIES.GENERAL }),
  new SelectOption({ name: 'Airports', value: SETTING_CATEGORIES.AIRPORTS }),
  new SelectOption({ name: 'Airport Hours', value: SETTING_CATEGORIES.AIRPORT_HOURS }),
  new SelectOption({ name: 'Runway', value: SETTING_CATEGORIES.RUNWAY }),
  new SelectOption({ name: 'Bulletin', value: SETTING_CATEGORIES.BULLETIN }),
  new SelectOption({ name: 'Operational Information', value: SETTING_CATEGORIES.OPERATIONAL_INFORMATION }),
  new SelectOption({ name: 'Customs', value: SETTING_CATEGORIES.CUSTOMS }),
  new SelectOption({ name: 'Security', value: SETTING_CATEGORIES.SECURITY }),
  new SelectOption({ name: 'Airport Permissions', value: SETTING_CATEGORIES.AIRPORT_PERMISSIONS }),
  new SelectOption({ name: 'Airport Data Export', value: SETTING_CATEGORIES.AIRPORT_DATA_EXPORT }),
];

export const settingList: ISubCategorySetting[] = [
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
    settingLabel: 'Distance UOMs',
    settingId: SETTING_ID.DISTANCE_UOM,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Airport Types',
    settingId: SETTING_ID.AIRPORT_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Airport Facility Types',
    settingId: SETTING_ID.AIRPORT_FACILITY_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Airport Directions',
    settingId: SETTING_ID.AIRPORT_DIRECTION,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Airport Usage Types',
    settingId: SETTING_ID.AIRPORT_USAGE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Airport Facility Access Levels',
    settingId: SETTING_ID.AIRPORT_FACILITY_ACCESS_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'WeightUOM',
    settingId: SETTING_ID.WEIGHTUOM,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Official ICAO Codes',
    settingId: SETTING_ID.OFFICIAL_ICAO_CODE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Military Use Type',
    settingId: SETTING_ID.MILITARY_USE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Airport Data Source',
    settingId: SETTING_ID.AIRPORT_DATA_SOURCE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_HOURS,
    settingLabel: 'Airport Hour Buffers',
    settingId: SETTING_ID.AIRPORT_HOURS_BUFFER,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_HOURS,
    settingLabel: 'Rejection Reason',
    settingId: SETTING_ID.REJECTION_REASON,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_HOURS,
    settingLabel: 'Airport Hour Types',
    settingId: SETTING_ID.AIRPORT_HOUR_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_HOURS,
    settingLabel: 'Airport Hour Sub Types',
    settingId: SETTING_ID.AIRPORT_HOUR_SUB_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_HOURS,
    settingLabel: 'Airport Hour Remarks',
    settingId: SETTING_ID.AIRPORT_HOUR_REMARK,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_HOURS,
    settingLabel: 'Condition Types',
    settingId: SETTING_ID.CONDITION_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_HOURS,
    settingLabel: 'Overtime',
    settingId: SETTING_ID.OVERTIME,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_HOURS,
    settingLabel: 'Segment Type',
    settingId: SETTING_ID.SEGMENT_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_HOURS,
    settingLabel: 'Conditional Operators',
    settingId: SETTING_ID.CONDITIONAL_OPERATOR,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_HOURS,
    settingLabel: 'Schedule Types',
    settingId: SETTING_ID.SCHEDULE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.RUNWAY,
    settingLabel: 'Surface Type',
    settingId: SETTING_ID.RUNWAY_SURFACE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.RUNWAY,
    settingLabel: 'Condition',
    settingId: SETTING_ID.RUNWAY_CONDITION,
  },
  {
    categoryId: SETTING_CATEGORIES.RUNWAY,
    settingLabel: 'Surface Treatment',
    settingId: SETTING_ID.RUNWAY_SURFACE_TREATMENT,
  },
  {
    categoryId: SETTING_CATEGORIES.RUNWAY,
    settingLabel: 'Light Type',
    settingId: SETTING_ID.RUNWAY_LIGHT_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.RUNWAY,
    settingLabel: 'Approach Lights',
    settingId: SETTING_ID.RUNWAY_APPROACH_LIGHT,
  },
  {
    categoryId: SETTING_CATEGORIES.RUNWAY,
    settingLabel: 'RVR',
    settingId: SETTING_ID.RUNWAY_RVR,
  },
  {
    categoryId: SETTING_CATEGORIES.RUNWAY,
    settingLabel: 'VGSI',
    settingId: SETTING_ID.RUNWAY_VGSI,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Airport Category',
    settingId: SETTING_ID.AIRPORT_CATEGORY,
  },
  {
    categoryId: SETTING_CATEGORIES.RUNWAY,
    settingLabel: 'Navaids',
    settingId: SETTING_ID.RUNWAY_NAVAIDS,
  },
  {
    categoryId: SETTING_CATEGORIES.RUNWAY,
    settingLabel: 'ILS Approach Type',
    settingId: SETTING_ID.RUNWAY_APPROACH_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.RUNWAY,
    settingLabel: 'Usage Type',
    settingId: SETTING_ID.RUNWAY_USAGE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Weather Reporting System',
    settingId: SETTING_ID.WEATHER_REPORTING_SYSTEM,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Class Code',
    settingId: SETTING_ID.AIRPORT_CLASS_CODE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Certificate Code',
    settingId: SETTING_ID.AIRPORT_CERTIFICATE_CODE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Service Code',
    settingId: SETTING_ID.AIRPORT_SERVICE_CODE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Airport Of Entry',
    settingId: SETTING_ID.AIRPORT_OF_ENTRY,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Frequency Types',
    settingId: SETTING_ID.FREQUENCY_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Sector',
    settingId: SETTING_ID.SECTOR,
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
    settingLabel: 'Bulletin Sources ',
    settingId: SETTING_ID.BULLETIN_SOURCE,
  },
  {
    categoryId: SETTING_CATEGORIES.BULLETIN,
    settingLabel: 'Bulletin Priorities',
    settingId: SETTING_ID.BULLETIN_PRIORITY,
  },
  {
    categoryId: SETTING_CATEGORIES.OPERATIONAL_INFORMATION,
    settingLabel: 'Fuel Types',
    settingId: SETTING_ID.FUEL_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.OPERATIONAL_INFORMATION,
    settingLabel: 'Oil Types',
    settingId: SETTING_ID.OIL_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMS,
    settingLabel: 'Area Port Assignment',
    settingId: SETTING_ID.AREA_PORT_ASSIGNMENT,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMS,
    settingLabel: 'CBP Port Type',
    settingId: SETTING_ID.CBP_PORT_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMS,
    settingLabel: 'Customs Location Information',
    settingId: SETTING_ID.CUSTOMS_LOCATION_INFORMATION,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMS,
    settingLabel: 'Field Office Oversight',
    settingId: SETTING_ID.FIELD_OFFICE_OVERSIGHT,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMS,
    settingLabel: 'Max POB Option',
    settingId: SETTING_ID.MAX_POB_OPTION,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMS,
    settingLabel: 'Required Information Type',
    settingId: SETTING_ID.REQUIRED_INFORMATION_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMS,
    settingLabel: 'Visa Timing',
    settingId: SETTING_ID.VISA_TIMING,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'UWA Code',
    settingId: SETTING_ID.UWA_CODE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Regional Code',
    settingId: SETTING_ID.REGIONAL_CODE,
  },
  {
    categoryId: SETTING_CATEGORIES.SECURITY,
    settingLabel: 'Ramp Side Access',
    settingId: SETTING_ID.RAMP_SIDE_ACCESS,
  },
  {
    categoryId: SETTING_CATEGORIES.SECURITY,
    settingLabel: 'Ramp Side Access 3rd Party',
    settingId: SETTING_ID.RAMP_SIDE_ACCESS_THIRD_PARTY,
  },
  {
    categoryId: SETTING_CATEGORIES.SECURITY,
    settingLabel: 'Ramp Side Access 3rd Party Vendors',
    settingId: SETTING_ID.RAMP_SIDE_ACCESS_THIRD_PARTY_VENDORS,
  },
  {
    categoryId: SETTING_CATEGORIES.SECURITY,
    settingLabel: 'Security Measures',
    settingId: SETTING_ID.SECURITY_MEASURES,
  },
  {
    categoryId: SETTING_CATEGORIES.SECURITY,
    settingLabel: 'Recommended Services',
    settingId: SETTING_ID.RECOMMENDED_SERVICES,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORTS,
    settingLabel: 'Destination Alternate Type of Flight',
    settingId: SETTING_ID.DESTINATION_ALTERNATE_TYPE_OF_FLIGHT,
  },
  {
    categoryId: SETTING_CATEGORIES.BULLETIN,
    settingLabel: 'Capps Category Code',
    settingId: SETTING_ID.CAPPS_CATEGORY_CODE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_HOURS,
    settingLabel: 'Flight Type',
    settingId: SETTING_ID.FLIGHT_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_HOURS,
    settingLabel: 'Condition Type Config',
    settingId: SETTING_ID.CONDITION_TYPE_CONFIG,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_HOURS,
    settingLabel: 'Noise Classification',
    settingId: SETTING_ID.NOISE_CLASSIFICATION,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMS,
    settingLabel: 'Lead Time Type',
    settingId: SETTING_ID.LEAD_TIME_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.OPERATIONAL_INFORMATION,
    settingLabel: 'Large Aircraft Restriction',
    settingId: SETTING_ID.LARGE_AIRCRAFT_RESTRICTION,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMS,
    settingLabel: 'Contact Type',
    settingId: SETTING_ID.CONTACT_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMS,
    settingLabel: 'Contact Address Type',
    settingId: SETTING_ID.CONTACT_ADDRESS_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.OPERATIONAL_INFORMATION,
    settingLabel: 'Overnight Parking',
    settingId: SETTING_ID.OVERNIGHT_PARKING,
  },
  {
    categoryId: SETTING_CATEGORIES.CUSTOMS,
    settingLabel: 'Note Type',
    settingId: SETTING_ID.NOTE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_PERMISSIONS,
    settingLabel: 'Confirmation Required For',
    settingId: SETTING_ID.CONFIRMATION_REQUIRED_FOR,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_PERMISSIONS,
    settingLabel: 'Permission Type',
    settingId: SETTING_ID.PERMISSION_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_PERMISSIONS,
    settingLabel: 'Required For',
    settingId: SETTING_ID.REQUIRED_FOR,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_PERMISSIONS,
    settingLabel: 'Exception Requirement',
    settingId: SETTING_ID.EXCEPTION_REQUIREMENT,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_PERMISSIONS,
    settingLabel: 'Notification Type',
    settingId: SETTING_ID.NOTIFICATION_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_PERMISSIONS,
    settingLabel: 'Request Format',
    settingId: SETTING_ID.REQUEST_FORMAT,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_PERMISSIONS,
    settingLabel: 'Request Address Type',
    settingId: SETTING_ID.REQUEST_ADDRESS_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_PERMISSIONS,
    settingLabel: 'PPR Purpose',
    settingId: SETTING_ID.PPR_PURPOSE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_PERMISSIONS,
    settingLabel: 'Exception Entity Type',
    settingId: SETTING_ID.EXCEPTION_ENTITY_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_PERMISSIONS,
    settingLabel: 'Exception Conditional Operator',
    settingId: SETTING_ID.EXCEPTION_CONDITIONAL_OPERATOR,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_PERMISSIONS,
    settingLabel: 'Exception Entity Parameter Config',
    settingId: SETTING_ID.EXCEPTION_ENTITY_PARAMETER_CONFIG,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_DATA_EXPORT,
    settingLabel: 'Report Type',
    settingId: SETTING_ID.REPORT_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_DATA_EXPORT,
    settingLabel: 'Request Status',
    settingId: SETTING_ID.REQUEST_STATUS,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_PERMISSIONS,
    settingLabel: 'Lead Time UOM',
    settingId: SETTING_ID.LEAD_TIME_UOM,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_PERMISSIONS,
    settingLabel: 'Document',
    settingId: SETTING_ID.DOCUMENT,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRPORT_PERMISSIONS,
    settingLabel: 'Lead Time Type',
    settingId: SETTING_ID.PERMISSION_LEAD_TIME_TYPE,
  },
];
