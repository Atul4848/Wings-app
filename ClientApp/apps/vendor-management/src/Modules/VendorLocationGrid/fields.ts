import {
  VMS_COMPARISON_TYPE,
  VENDOR_LOCATION_COMPARISON_FILTERS,
  VENDOR_LOCATION_DATA_FILTERS,
  VENDOR_LOCATION_HOURS_FILTERS,
} from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const gridFilters: IAPIFilterDictionary<VENDOR_LOCATION_COMPARISON_FILTERS>[] = [
  {
    columnId: 'vendor.vendorName',
    apiPropertyName: 'Vendor.Name',
    uiFilterType: VENDOR_LOCATION_COMPARISON_FILTERS.VENDOR_NAME,
  },
  {
    columnId: 'vendor.vendorCode',
    apiPropertyName: 'Vendor.Code',
    uiFilterType: VENDOR_LOCATION_COMPARISON_FILTERS.VENDOR_CODE,
  },
  {
    columnId: 'locationName',
    apiPropertyName: 'Name',
    uiFilterType: VENDOR_LOCATION_COMPARISON_FILTERS.LOCATION_NAME,
  },
  {
    columnId: 'locationCode',
    apiPropertyName: 'Code',
    uiFilterType: VENDOR_LOCATION_COMPARISON_FILTERS.LOCATION_CODE,
  },
  {
    columnId: 'airportReference',
    apiPropertyName: 'airportReference.AirportCode',
    uiFilterType: VENDOR_LOCATION_COMPARISON_FILTERS.AIRPORT_CODE,
  },
  {
    columnId: 'locationStatus',
    apiPropertyName: 'VendorLocationStatus.Name',
    uiFilterType: VENDOR_LOCATION_COMPARISON_FILTERS.LOCATION_STATUS,
  },
];

export const hoursGridFilters: IAPIFilterDictionary<VENDOR_LOCATION_HOURS_FILTERS>[] = [
  {
    columnId: 'sequence',
    apiPropertyName: 'Sequence',
    uiFilterType: VENDOR_LOCATION_HOURS_FILTERS.SEQUENCE,
  },
  {
    columnId: 'hoursType',
    apiPropertyName: 'HoursType',
    uiFilterType: VENDOR_LOCATION_HOURS_FILTERS.HOURS_TYPE,
  },
  {
    columnId: 'hoursScheduleType',
    apiPropertyName: 'HoursScheduleType',
    uiFilterType: VENDOR_LOCATION_HOURS_FILTERS.SCHEDULE_TYPE,
  },
  {
    columnId: 'schedule.startDate',
    apiPropertyName: 'Schedule.StartDate',
    uiFilterType: VENDOR_LOCATION_HOURS_FILTERS.START_DATE,
  },
  {
    columnId: 'schedule.endDate',
    apiPropertyName: 'Schedule.EndDate',
    uiFilterType: VENDOR_LOCATION_HOURS_FILTERS.END_DATE,
  },
  {
    columnId: 'schedule.is24Hours',
    apiPropertyName: 'Schedule.Is24Hours',
    uiFilterType: VENDOR_LOCATION_HOURS_FILTERS.IS_24_HOURS,
  },
  {
    columnId: 'schedule.startTime',
    apiPropertyName: 'Schedule.StartTime',
    uiFilterType: VENDOR_LOCATION_HOURS_FILTERS.START_TIME_LOCAL,
  },
  {
    columnId: 'schedule.endTime',
    apiPropertyName: 'Schedule.EndTime',
    uiFilterType: VENDOR_LOCATION_HOURS_FILTERS.END_TIME_LOCAL,
  },
  {
    columnId: 'schedule.includeHoliday',
    apiPropertyName: 'Schedule.IncludeHoliday',
    uiFilterType: VENDOR_LOCATION_HOURS_FILTERS.INCLUDE_HOLIDAYS,
  },
  {
    columnId: 'status',
    apiPropertyName: 'Status',
    uiFilterType: VENDOR_LOCATION_HOURS_FILTERS.STATUS,
  },
  {
    columnId: 'accessLevel',
    apiPropertyName: 'AccessLevel',
    uiFilterType: VENDOR_LOCATION_HOURS_FILTERS.ACCESS_LEVEL,
  }
]

export const comparisonType = {
  [VMS_COMPARISON_TYPE.ADDED]: 'Added',
  [VMS_COMPARISON_TYPE.MODIFIED]: 'Modified',
  [VMS_COMPARISON_TYPE.DELETED]: 'Removed',
};

export const vendorImportDataFiltersMap = {
  [VENDOR_LOCATION_DATA_FILTERS.VENDOR_NAME]: null,
  [VENDOR_LOCATION_DATA_FILTERS.LOCATION_NAME]: 1,
  [VENDOR_LOCATION_DATA_FILTERS.LOCATION_CODE]: 2,
  [VENDOR_LOCATION_DATA_FILTERS.LOCATION_STATUS]: 3,
};

