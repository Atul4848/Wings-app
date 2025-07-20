import { ISubCategorySetting } from '@wings/shared';
import {
  SETTING_CATEGORIES,
  SETTING_ID,
  PARAMETERS_SETTINGS_COMPARISON_FILTERS,
  PARAMETERS_SETTINGS_DATA_FILTERS,
  VMS_COMPARISON_TYPE,
  VENDOR_ADDRESS_DATA_FILTER,
} from '../Shared';
import { SelectOption, IAPIFilterDictionary } from '@wings-shared/core';

export const categoryList: SelectOption[] = [
  new SelectOption({ name: 'General', value: SETTING_CATEGORIES.GENERAL }),
  new SelectOption({ name: 'Vendors', value: SETTING_CATEGORIES.VENDORS }),
  new SelectOption({ name: 'Vendor Locations', value: SETTING_CATEGORIES.VENDOR_LOCATIONS }),
  new SelectOption({ name: 'Vendor Pricing', value: SETTING_CATEGORIES.VENDOR_PRICING_SETTINGS }),
  new SelectOption({ name: 'Contacts', value: SETTING_CATEGORIES.VENDOR_CONTACTS }),
  new SelectOption({ name: 'Address', value: SETTING_CATEGORIES.VENDOR_ADDRESS }),
  new SelectOption({ name: 'Document', value: SETTING_CATEGORIES.VENDOR_DOCUMENT }),
  new SelectOption({ name: 'Operational Essential', value: SETTING_CATEGORIES.VENDOR_OPERATIONAL_ESSENTIAL }),
  new SelectOption({ name: 'Location Hours', value: SETTING_CATEGORIES.VENDOR_HOURS }),
  new SelectOption({ name: 'Air2Ground Location', value: SETTING_CATEGORIES.VENDOR_AIR2GROUND_LOCATION }),
  new SelectOption({ name: 'Operational Insights', value: SETTING_CATEGORIES.VENDOR_OPERATIONAL_INSIGHTS }),
  new SelectOption({ name: 'Order Management Software', value: SETTING_CATEGORIES.VENDOR_ORDER_MANAGEMENT_SOFTWARE }),
];

export const settingList: ISubCategorySetting[] = [
  {
    categoryId: SETTING_CATEGORIES.GENERAL,
    settingLabel: 'Access Levels',
    settingId: SETTING_ID.SETTING_ACCESS_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDORS,
    settingLabel: 'Status',
    settingId: SETTING_ID.STATUS,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_LOCATIONS,
    settingLabel: 'Status',
    settingId: SETTING_ID.LOCATION_STATUS,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_PRICING_SETTINGS,
    settingLabel: 'Parameters',
    settingId: SETTING_ID.SETTINGS_PARAMETERS,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_PRICING_SETTINGS,
    settingLabel: 'Units',
    settingId: SETTING_ID.SETTINGS_UNITS,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_PRICING_SETTINGS,
    settingLabel: 'Handling Fees Type',
    settingId: SETTING_ID.SETTINGS_HANDLING_FEES,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_PRICING_SETTINGS,
    settingLabel: 'Currency',
    settingId: SETTING_ID.SETTINGS_CURRENCY,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_PRICING_SETTINGS,
    settingLabel: 'Service Item Name',
    settingId: SETTING_ID.SETTINGS_SERVICE_ITEM_NAME,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_PRICING_SETTINGS,
    settingLabel: 'Service Category',
    settingId: SETTING_ID.SETTINGS_SERVICE_CATEGORY,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_PRICING_SETTINGS,
    settingLabel: 'Status',
    settingId: SETTING_ID.SETTINGS_PRICING_STATUS,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_CONTACTS,
    settingLabel: 'Contact Method',
    settingId: SETTING_ID.SETTING_CONTACT_METHOD,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_CONTACTS,
    settingLabel: 'Contact Type',
    settingId: SETTING_ID.SETTING_CONTACT_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_CONTACTS,
    settingLabel: 'Status',
    settingId: SETTING_ID.SETTINGS_CONTACT_STATUS,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_CONTACTS,
    settingLabel: 'Communication Service',
    settingId: SETTING_ID.SETTING_COMMUNICATION_SERVICE,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_CONTACTS,
    settingLabel: 'Usage Type',
    settingId: SETTING_ID.SETTING_USAGES_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_ADDRESS,
    settingLabel: 'Address Type',
    settingId: SETTING_ID.SETTING_ADDRESS_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_DOCUMENT,
    settingLabel: 'Name',
    settingId: SETTING_ID.SETTING_DOCUMENT_NAME,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_DOCUMENT,
    settingLabel: 'Status',
    settingId: SETTING_ID.SETTING_DOCUMENT_STATUS,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_ESSENTIAL,
    settingLabel: 'Vendor Level',
    settingId: SETTING_ID.SETTINGS_VENDOR_LEVEL,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_ESSENTIAL,
    settingLabel: 'Certified Member Fee Schedule',
    settingId: SETTING_ID.SETTINGS_CERTIFIED_MEMBER_FEE_SCHEDULE,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_ESSENTIAL,
    settingLabel: 'Payment Options',
    settingId: SETTING_ID.SETTINGS_PAYMENTS_OPTIONS,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_ESSENTIAL,
    settingLabel: 'Credit Available',
    settingId: SETTING_ID.SETTINGS_CREDIT_AVAILABLE,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_ESSENTIAL,
    settingLabel: 'Main Services Offered',
    settingId: SETTING_ID.SETTINGS_MAIN_SERVICE_OFFERED,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_ESSENTIAL,
    settingLabel: 'Operation Type',
    settingId: SETTING_ID.SETTINGS_OPERATON_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_HOURS,
    settingLabel: 'Hours Types',
    settingId: SETTING_ID.SETTINGS_HOURS_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_HOURS,
    settingLabel: 'Schedule Type',
    settingId: SETTING_ID.SETTINGS_HOURS_SCHEDULE_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_HOURS,
    settingLabel: 'Status',
    settingId: SETTING_ID.SETTINGS_HOURS_STATUS,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_AIR2GROUND_LOCATION,
    settingLabel: 'A2G Location Type',
    settingId: SETTING_ID.SETTING_A2G_LOCATION_TYPE,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_INSIGHTS,
    settingLabel: 'Driver Pick Up Location Type - CREW',
    settingId: SETTING_ID.SETTING_DRIVER_LOCATION_CREW,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_INSIGHTS,
    settingLabel: 'Driver Pick Up Location Type - PAX',
    settingId: SETTING_ID.SETTING_DRIVER_LOCATION_PAX,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_INSIGHTS,
    settingLabel: 'Amenities',
    settingId: SETTING_ID.SETTING_AMENITIES,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_INSIGHTS,
    settingLabel: 'Aircraft Parking Options',
    settingId: SETTING_ID.SETTING_AIRCRAFT_PARKING_OPTIONS,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_INSIGHTS,
    settingLabel: 'Aircraft Parking Distance from FBO',
    settingId: SETTING_ID.SETTING_AIRCRAFT_PARKING_DISTANCE_FBO,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_INSIGHTS,
    settingLabel: 'Aircraft Spot Accommodation',
    settingId: SETTING_ID.SETTING_AIRCRAFT_SPOT_ACCOMMODATION,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_INSIGHTS,
    settingLabel: 'Towbar Scenarios',
    settingId: SETTING_ID.SETTING_TOWBAR_SCENARIOS,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_INSIGHTS,
    settingLabel: 'International Departure Procedures',
    settingId: SETTING_ID.SETTING_INTERNATIONAL_DEPARTURE_PROCEDURES,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_INSIGHTS,
    settingLabel: 'International Arrival Procedures',
    settingId: SETTING_ID.SETTING_INTERNATIONAL_ARRIVAL_PROCEDURES,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_INSIGHTS,
    settingLabel: 'Available Facilities',
    settingId: SETTING_ID.SETTING_AVAILABLE_FACILITIES,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_INSIGHTS,
    settingLabel: 'Luggage Handling',
    settingId: SETTING_ID.SETTING_LUGGAGE_HANDLING,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_INSIGHTS,
    settingLabel: 'Arrival Crew/Pax Passport Handling',
    settingId: SETTING_ID.SETTING_ARRIVAL_CREW_PAX_PASSPORT_HANDLING,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_INSIGHTS,
    settingLabel: 'Disability Accommodations',
    settingId: SETTING_ID.SETTING_DISABILITY_ACCOMMODATIONS,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_OPERATIONAL_INSIGHTS,
    settingLabel: 'Hanger Available UOM',
    settingId: SETTING_ID.SETTING_HANGER_AVAILABLE_UOM,
  },
  {
    categoryId: SETTING_CATEGORIES.VENDOR_ORDER_MANAGEMENT_SOFTWARE,
    settingLabel: 'Order Management Software List',
    settingId: SETTING_ID.SETTING_ORDER_MANAGEMENT_SOFTWARE,
  },
];

export const gridFilters: IAPIFilterDictionary<PARAMETERS_SETTINGS_COMPARISON_FILTERS>[] = [
  {
    columnId: 'Name',
    apiPropertyName: 'Name',
    uiFilterType: PARAMETERS_SETTINGS_COMPARISON_FILTERS.PARAMETERS_NAME,
  },
];

export const addressGridFilters: IAPIFilterDictionary<VENDOR_ADDRESS_DATA_FILTER>[] = [
  {
    columnId: 'addressType',
    apiPropertyName: 'AddressType',
    uiFilterType: VENDOR_ADDRESS_DATA_FILTER.ADDRESS_TYPE,
  },
  {
    columnId: 'addressLine1',
    apiPropertyName: 'AddressLine1',
    uiFilterType: VENDOR_ADDRESS_DATA_FILTER.ADDRESS_LINE_1,
  },
  {
    columnId: 'addressLine2',
    apiPropertyName: 'AddressLine2',
    uiFilterType: VENDOR_ADDRESS_DATA_FILTER.ADDRESS_LINE_2,
  },
  {
    columnId: 'countryReference',
    apiPropertyName: 'Country',
    uiFilterType: VENDOR_ADDRESS_DATA_FILTER.COUNTRY,
  },
  {
    columnId: 'stateReference',
    apiPropertyName: 'State',
    uiFilterType: VENDOR_ADDRESS_DATA_FILTER.STATE,
  },
  {
    columnId: 'cityReference',
    apiPropertyName: 'City',
    uiFilterType: VENDOR_ADDRESS_DATA_FILTER.CITY,
  },
  {
    columnId: 'zipcode',
    apiPropertyName: 'Zipcode',
    uiFilterType: VENDOR_ADDRESS_DATA_FILTER.ZIP_CODE,
  },
];

export const comparisonType = {
  [VMS_COMPARISON_TYPE.ADDED]: 'Added',
  [VMS_COMPARISON_TYPE.MODIFIED]: 'Modified',
  [VMS_COMPARISON_TYPE.DELETED]: 'Removed',
};

export const vendorImportDataFiltersMap = {
  [PARAMETERS_SETTINGS_DATA_FILTERS.PARAMETERS_NAME]: null,
};

export const orderSoftwareFilter: IAPIFilterDictionary<PARAMETERS_SETTINGS_COMPARISON_FILTERS>[] = [
  {
    columnId: 'orderManagementSoftware',
    apiPropertyName: 'orderManagementSoftware',
    uiFilterType: PARAMETERS_SETTINGS_COMPARISON_FILTERS.PARAMETERS_NAME,
  },
];

