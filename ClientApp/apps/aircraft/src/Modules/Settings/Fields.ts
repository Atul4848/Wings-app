import { ISubCategorySetting } from '@wings/shared';
import { SETTING_CATEGORIES, SETTING_ID } from '../Shared';
import { SelectOption } from '@wings-shared/core';

export const categoryList: SelectOption[] = [
  new SelectOption({ name: 'Aircraft Base', value: SETTING_CATEGORIES.BASE }),
  new SelectOption({ name: 'Avionics', value: SETTING_CATEGORIES.AVIONICS }),
  new SelectOption({ name: 'ETP Policies', value: SETTING_CATEGORIES.ETP_POLICIES }),
  new SelectOption({ name: 'General', value: SETTING_CATEGORIES.GENERAL }),
  new SelectOption({ name: 'Registry', value: SETTING_CATEGORIES.REGISTRY }),
  new SelectOption({ name: 'Speed Schedules', value: SETTING_CATEGORIES.SPEED_SCHEDULE }),
  new SelectOption({ name: 'Units of measure', value: SETTING_CATEGORIES.UNITS }),
  new SelectOption({ name: 'Flight Planning Service', value: SETTING_CATEGORIES.FLIGHT_PLANNING_SERVICE }),
  new SelectOption({ name: 'Airframe', value: SETTING_CATEGORIES.AIRFRAME }),
];

export const settingList: ISubCategorySetting[] = [
  {
    categoryId: SETTING_CATEGORIES.AVIONICS,
    settingLabel: 'ACARS Manufacturer',
    settingId: SETTING_ID.ACARS_MANUFACTURER,
  },
  {
    categoryId: SETTING_CATEGORIES.AVIONICS,
    settingLabel: 'ACARS Message Set',
    settingId: SETTING_ID.ACARS_MESSAGE_SET,
  },
  {
    categoryId: SETTING_CATEGORIES.AVIONICS,
    settingLabel: 'ACARS Model',
    settingId: SETTING_ID.ACARS_MODEL,
  },
  {
    categoryId: SETTING_CATEGORIES.AVIONICS,
    settingLabel: 'ACARS Software Version',
    settingId: SETTING_ID.ACARS_SOFTWARE_VERSION,
  },
  {
    categoryId: SETTING_CATEGORIES.AVIONICS,
    settingLabel: 'AES Manufacturer',
    settingId: SETTING_ID.AES_MANUFACTURER,
  },
  {
    categoryId: SETTING_CATEGORIES.AVIONICS,
    settingLabel: 'AES Model',
    settingId: SETTING_ID.AES_MODEL,
  },
  {
    categoryId: SETTING_CATEGORIES.AVIONICS,
    settingLabel: 'FMS Manufacturer',
    settingId: SETTING_ID.FMS_MANUFACTURER,
  },

  {
    categoryId: SETTING_CATEGORIES.AVIONICS,
    settingLabel: 'FMS Model',
    settingId: SETTING_ID.FMS_MODEL,
  },
  {
    categoryId: SETTING_CATEGORIES.AVIONICS,
    settingLabel: 'FMS Software Version',
    settingId: SETTING_ID.FMS_SOFTWARE_VERSION,
  },
  {
    categoryId: SETTING_CATEGORIES.AVIONICS,
    settingLabel: 'RAIM Receiver Type',
    settingId: SETTING_ID.RAIM_RECEIVER_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.AVIONICS,
    settingLabel: 'RAIM Report Type',
    settingId: SETTING_ID.RAIM_REPORT_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Aircraft Color',
    settingId: SETTING_ID.AIRCRAFT_COLOR,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Aircraft Modification',
    settingId: SETTING_ID.AIRCRAFT_MODIFICATION,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Aircraft Noise Type',
    settingId: SETTING_ID.AIRCRAFT_NOISE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Airframe Status',
    settingId: SETTING_ID.AIRFRAME_STATUS,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Categories',
    settingId: SETTING_ID.CATEGORIES,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Engine Type',
    settingId: SETTING_ID.ENGINE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Fire Category',
    settingId: SETTING_ID.FIRE_CATEGORY,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Flight Plan Format Status',
    settingId: SETTING_ID.FLIGHT_PLAN_FORMAT_STATUS,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Fuel Reserve Policy',
    settingId: SETTING_ID.FUEL_RESERVE_POLICY,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Fuel Type',
    settingId: SETTING_ID.FUEL_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'ICAO Aerodrome Reference Code',
    settingId: SETTING_ID.ICAO_AERODROME_REFERENCE_CODE,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Make',
    settingId: SETTING_ID.AIRCRAFT_MAKE,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Model',
    settingId: SETTING_ID.MODEL,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Military Designation',
    settingId: SETTING_ID.MILITARY_DESIGNATION,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'NFP Fuel Reserve Type',
    settingId: SETTING_ID.NFP_FUEL_RESERVE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Noise Chapter',
    settingId: SETTING_ID.NOISE_CHAPTER,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Noise Chapter Configuration',
    settingId: SETTING_ID.NOISE_CHAPTER_CONFIGURATION,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Noise Date Type Certification',
    settingId: SETTING_ID.NOISE_DATA_TYPE_CERTIFICATION,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'STC Manufacture',
    settingId: SETTING_ID.STC_MANUFACTURE,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Series',
    settingId: SETTING_ID.SERIES,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Sub Category',
    settingId: SETTING_ID.SUB_CATEGORY,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'ICAO Type Designator',
    settingId: SETTING_ID.ICAO_TYPE_DESIGNATOR,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Wake Turbulence Categories',
    settingId: SETTING_ID.WAKE_TURBULENCE_CATEGORY,
  },
  {
    categoryId: SETTING_CATEGORIES.ETP_POLICIES,
    settingLabel: 'ETP Alt Descent Profile',
    settingId: SETTING_ID.ETP_ALT_DESCENT_PROFILE,
  },
  {
    categoryId: SETTING_CATEGORIES.ETP_POLICIES,
    settingLabel: 'ETP Cruise Profile',
    settingId: SETTING_ID.ETP_CRUISE_PROFILE,
  },
  {
    categoryId: SETTING_CATEGORIES.ETP_POLICIES,
    settingLabel: 'ETP Final Descent',
    settingId: SETTING_ID.ETP_FINAL_DESCENT,
  },
  {
    categoryId: SETTING_CATEGORIES.ETP_POLICIES,
    settingLabel: 'ETP Hold Method',
    settingId: SETTING_ID.ETP_HOLD_METHOD,
  },
  {
    categoryId: SETTING_CATEGORIES.ETP_POLICIES,
    settingLabel: 'ETP Levels',
    settingId: SETTING_ID.ETP_LEVELS,
  },

  {
    categoryId: SETTING_CATEGORIES.ETP_POLICIES,
    settingLabel: 'ETP Main Descent',
    settingId: SETTING_ID.ETP_MAIN_DESCENT,
  },

  {
    categoryId: SETTING_CATEGORIES.ETP_POLICIES,
    settingLabel: 'ETP Penalty Apply',
    settingId: SETTING_ID.ETP_PENALTY_APPLY,
  },
  {
    categoryId: SETTING_CATEGORIES.ETP_POLICIES,
    settingLabel: 'ETP Penalty Bias Type',
    settingId: SETTING_ID.ETP_PENALTY_BIAS_TYPE,
  },

  {
    categoryId: SETTING_CATEGORIES.ETP_POLICIES,
    settingLabel: 'ETP Penalty Category',
    settingId: SETTING_ID.ETP_PENALTY_CATEGORY,
  },
  {
    categoryId: SETTING_CATEGORIES.ETP_POLICIES,
    settingLabel: 'ETP Scenario Engine',
    settingId: SETTING_ID.ETP_SCENARIO_ENGINE,
  },
  {
    categoryId: SETTING_CATEGORIES.ETP_POLICIES,
    settingLabel: 'ETP Scenario Type',
    settingId: SETTING_ID.ETP_SCENARIO_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.ETP_POLICIES,
    settingLabel: 'ETP Time Limit',
    settingId: SETTING_ID.ETP_TIME_LIMIT,
  },
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
    categoryId: SETTING_CATEGORIES.REGISTRY,
    settingLabel: 'ACAS',
    settingId: SETTING_ID.ACAS,
  },
  {
    categoryId: SETTING_CATEGORIES.REGISTRY,
    settingLabel: 'Radio',
    settingId: SETTING_ID.RADIO,
  },
  {
    categoryId: SETTING_CATEGORIES.REGISTRY,
    settingLabel: 'Registry Identifier Country',
    settingId: SETTING_ID.REGISTRY_IDENTIFIER_COUNTRY,
  },
  {
    categoryId: SETTING_CATEGORIES.REGISTRY,
    settingLabel: 'Transponder',
    settingId: SETTING_ID.TRANSPONDER,
  },
  {
    categoryId: SETTING_CATEGORIES.SPEED_SCHEDULE,
    settingLabel: 'Climb Schedules',
    settingId: SETTING_ID.CLIMB_SCHEDULE,
  },

  {
    categoryId: SETTING_CATEGORIES.SPEED_SCHEDULE,
    settingLabel: 'Cruise Schedules',
    settingId: SETTING_ID.CRUISE_SCHEDULE,
  },
  {
    categoryId: SETTING_CATEGORIES.SPEED_SCHEDULE,
    settingLabel: 'Descent Schedules',
    settingId: SETTING_ID.DESCENT_SCHEDULE,
  },
  {
    categoryId: SETTING_CATEGORIES.SPEED_SCHEDULE,
    settingLabel: 'Hold Schedules',
    settingId: SETTING_ID.HOLD_SCHEDULE,
  },
  {
    categoryId: SETTING_CATEGORIES.UNITS,
    settingLabel: 'Distance UOM',
    settingId: SETTING_ID.DISTANCE_UOM,
  },
  {
    categoryId: SETTING_CATEGORIES.UNITS,
    settingLabel: 'Range UOM',
    settingId: SETTING_ID.RANGE_UOM,
  },
  {
    categoryId: SETTING_CATEGORIES.UNITS,
    settingLabel: 'Weight UOM',
    settingId: SETTING_ID.WEIGHT_UOM,
  },
  {
    categoryId: SETTING_CATEGORIES.UNITS,
    settingLabel: 'Wind UOM',
    settingId: SETTING_ID.WIND_UOM,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Other Name',
    settingId: SETTING_ID.OTHER_NAME,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Wake Turbulence Groups',
    settingId: SETTING_ID.WAKE_TURBULENCE_GROUP,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Popular Name',
    settingId: SETTING_ID.POPULAR_NAME,
  },
  {
    categoryId: SETTING_CATEGORIES.BASE,
    settingLabel: 'Propulsion Type',
    settingId: SETTING_ID.PROPULSION_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.FLIGHT_PLANNING_SERVICE,
    settingLabel: 'Type',
    settingId: SETTING_ID.FLIGHT_PLANNING_SERVICE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.FLIGHT_PLANNING_SERVICE,
    settingLabel: 'Runway Analysis',
    settingId: SETTING_ID.RUNWAY_ANALYSIS,
  },
  {
    categoryId: SETTING_CATEGORIES.FLIGHT_PLANNING_SERVICE,
    settingLabel: 'Delivery Package',
    settingId: SETTING_ID.DELIVERY_PACKAGE,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRFRAME,
    settingLabel: 'Uplink Vendor',
    settingId: SETTING_ID.UPLINK_VENDOR,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRFRAME,
    settingLabel: 'Catering Heating Element',
    settingId: SETTING_ID.CATERING_HEATING_ELEMENT,
  },
  {
    categoryId: SETTING_CATEGORIES.AIRFRAME,
    settingLabel: 'Outer Main Gear Wheel Span',
    settingId: SETTING_ID.OUTER_MAIN_GEAR_WHEEL_SPAN,
  },
];
