import { MenuItem } from '@wings-shared/layout';
import { FAA_IMPORT_STAGING_ENTITY_TYPE } from '../../Enums';
import { Utilities } from '@wings-shared/core';

/* istanbul ignore next */
export const airportSidebarOptions = (
  defaultOptions: boolean,
  isDisabled: boolean = false,
  isCustomsNoteDisabled: boolean = false
): MenuItem[] => (defaultOptions ? defaultAirportOptions : upsertAirportOptions(isDisabled, isCustomsNoteDisabled));

export const updatedAirportSidebarOptions = (tabQuery: string, searchQueryParams?: string): MenuItem[] =>
  Utilities.updateSidebarOptions(defaultAirportOptions, tabQuery, searchQueryParams);

export const updateAirportSidebarOptions = (
  tabQuery: string,
  isDisabled: boolean,
  searchQueryParams?: string,
  isCustomsNoteDisabled?: boolean
): MenuItem[] =>
  Utilities.updateSidebarOptions(upsertAirportOptions(isDisabled, isCustomsNoteDisabled), tabQuery, searchQueryParams);

export const airportReviewOptions = (): MenuItem[] => [
  { to: 'airport-hour-review', title: 'Airport Hour' },
  { to: 'airport-parking-review', title: 'Airport Parking' },
  { to: 'bulletins-review', title: 'Bulletins' },
  { to: 'custom-general-info-review', title: 'Custom General Info' },
  { to: 'airport-military-review', title: 'Airport Military' },
];

/* istanbul ignore next */
export const reviewInformation = (showRunways: boolean = false): MenuItem[] => {
  return [{ to: '', title: 'Review Details', icon: 'EyeIcon' }];
};

export const defaultAirportOptions: MenuItem[] = [
  { to: '', title: 'Airports', icon: 'AirplaneIcon' },
  { to: 'airport-hours', title: 'Airport Hours', icon: 'ClockIcon' },
  { to: 'bulletins', title: 'Bulletins', icon: 'WarningIcon' },
  { to: 'purged-bulletins', title: 'Purged Bulletins', icon: 'WarningIcon' },
  { to: 'import-faa', title: 'Import FAA', icon: 'CloudUploadIcon' },
  { to: 'airport-mappings', title: 'Airport Mappings', icon: 'MappingIcon' },
  { to: 'airport-mappings-beta', title: 'Airport Mappings Beta', icon: 'MappingIcon' },
  {
    to: 'airport-review',
    title: 'Airport Review',
    icon: 'EyeIcon',
    isOpen: false,
    children: airportReviewOptions(),
  },
  { to: 'airport-data-export', title: 'Airport Data Export', icon: 'DatabaseIcon' },
  { to: 'settings', title: 'Settings', icon: 'SettingIcon' },
];

export const upsertAirportOptions = (isDisabled: boolean, isCustomsNoteDisabled: boolean): MenuItem[] => [
  { to: '', title: 'General Information', icon: 'InfoIcon' },
  {
    to: 'operational-information',
    title: 'Operational Information',
    icon: 'ListIcon',
    isDisabled,
  },
  {
    to: 'flight-plan-information',
    title: 'Flight Plan Information',
    icon: 'AirplaneIcon',
    isDisabled,
  },
  { to: 'timezone-information', title: 'Timezone Information', icon: 'ClockIcon', isDisabled },
  { to: 'ownership', title: 'Ownership / Management', icon: 'PersonIcon', isDisabled },
  { to: 'airport-hours', title: 'Airport Hours', icon: 'ClockIcon', isDisabled },
  { to: 'runway', title: 'Runways', icon: 'AirportRunwayIcon', isDisabled },
  { to: 'runwayClosure', title: 'Runway Closure', icon: 'AirportRunwayIcon', isDisabled },
  { to: 'airport-frequencies', title: 'Airport Frequencies', icon: 'BroadcastIcon', isDisabled },
  { to: 'airport-permissions', title: 'Airport Permissions', icon: 'AirportPermissionIcon', isDisabled },
  {
    to: 'airport-security',
    title: 'Airport Security',
    icon: 'SecurityIcon',
    isDisabled,
  },
  {
    to: 'vendor-locations',
    title: 'Vendor Locations',
    icon: 'MapPointerIcon',
    isDisabled,
  },
  {
    to: 'associated-bulletins',
    title: 'Associated Bulletins',
    icon: 'WarningIcon',
    isDisabled,
  },
  {
    to: 'custom-detail',
    title: 'Custom Details',
    icon: 'CustomsIcon',
    isDisabled,
    isOpen: false,
    children: customDetailSidebarOptions(isDisabled, isCustomsNoteDisabled),
  },
];

/* istanbul ignore next */
export const faaImportReviewSidebarOptions = (showRunways: boolean = false): MenuItem[] => {
  return [
    { to: '', title: 'Review Information', icon: 'AirplaneIcon', replace: true },
    { to: 'runways', title: 'Runways', icon: 'AirportRunwayIcon', replace: true, isHidden: !showRunways },
  ];
};

/* istanbul ignore next */
// Options used in FAAFileDetails.tsx
export const faaImportFileDetailsSidebarOptions = (entity: FAA_IMPORT_STAGING_ENTITY_TYPE): MenuItem[] => {
  switch (entity) {
    case FAA_IMPORT_STAGING_ENTITY_TYPE.FREQUENCY:
      return [{ to: '', title: 'Frequencies', icon: 'BroadcastIcon', replace: true }];
    case FAA_IMPORT_STAGING_ENTITY_TYPE.AIRPORT:
    case FAA_IMPORT_STAGING_ENTITY_TYPE.RUNWAYS:
      return [
        { to: 'airports', title: 'Airports', icon: 'AirplaneIcon', replace: true },
        { to: 'runways', title: 'Runways', icon: 'AirportRunwayIcon', replace: true },
      ];
    default:
      return defaultAirportOptions;
  }
};

/* istanbul ignore next */
export const customDetailSidebarOptions = (isDisabled, isCustomsNoteDisabled): MenuItem[] => {
  return [
    { to: 'custom-detail/general', title: 'General Info', icon: 'InfoIcon', isDisabled },
    { to: 'custom-detail/customs-detail-info', title: 'Customs Details', icon: 'InfoIcon', isDisabled },
    {
      to: 'custom-detail/customs-notes',
      title: 'Customs Notes',
      icon: 'PhoneIcon',
      isDisabled: isDisabled || isCustomsNoteDisabled,
    },
    { to: 'custom-detail/us-customs-details', title: 'US Customs Details', icon: 'InfoIcon', isDisabled },
    { to: 'custom-detail/nonus-customs-details', title: 'Non US Customs Details', icon: 'InfoIcon', isDisabled },
    { to: 'custom-detail/custom-contacts', title: 'Contacts', icon: 'PhoneIcon', isDisabled },
  ];
};

export const airportBasePath = (airportId, icao, viewMode): string => {
  return `airports/upsert/${airportId}/${icao}/${viewMode}`;
};
