import { baseGridFiltersDictionary } from '@wings/shared';
import {
  FAA_COMPARISON_TYPE,
  FAA_IMPORT_COMPARISON_FILTERS,
  FAA_IMPORT_DATA_FILTERS,
  FAA_IMPORT_STATUS_FILTER,
  FAA_MERGE_STATUS,
  IMPORT_FILE_TYPE,
} from '../Shared';
import { IAPIFilterDictionary, ISelectOption, SettingsTypeModel } from '@wings-shared/core';

export const gridFilters: IAPIFilterDictionary<FAA_IMPORT_COMPARISON_FILTERS>[] = [
  ...baseGridFiltersDictionary<FAA_IMPORT_COMPARISON_FILTERS>(),
  {
    columnId: 'sourceLocationId',
    apiPropertyName: 'SourceLocationId',
    uiFilterType: FAA_IMPORT_COMPARISON_FILTERS.SOURCE_LOCATION_ID,
  },
  {
    columnId: 'icao',
    apiPropertyName: 'ICAO',
    uiFilterType: FAA_IMPORT_COMPARISON_FILTERS.ICAO,
  },
  {
    columnId: 'airportName',
    apiPropertyName: 'AirportName',
    uiFilterType: FAA_IMPORT_COMPARISON_FILTERS.AIRPORT_NAME,
  },
  {
    columnId: 'cityName',
    apiPropertyName: 'CityName',
    uiFilterType: FAA_IMPORT_COMPARISON_FILTERS.CITY_NAME,
  },
  {
    columnId: 'stateName',
    apiPropertyName: 'StateName',
    uiFilterType: FAA_IMPORT_COMPARISON_FILTERS.STATE_NAME,
  },
  {
    columnId: 'runwayId',
    apiPropertyName: 'RunwayId',
    uiFilterType: FAA_IMPORT_COMPARISON_FILTERS.RUNWAY_ID,
  },
  {
    columnId: 'faaMergeStatus',
    apiPropertyName: 'FAAMergeStatus',
    uiFilterType: FAA_IMPORT_COMPARISON_FILTERS.FAA_MERGE_STATUS,
  },
  {
    columnId: 'faaComparisonType',
    apiPropertyName: 'FAAComparisonType',
  },
];

export const faaGgridFilters: IAPIFilterDictionary<FAA_IMPORT_STATUS_FILTER>[] = [
  ...baseGridFiltersDictionary<FAA_IMPORT_STATUS_FILTER>(),
  {
    columnId: 'blobName',
    apiPropertyName: 'BlobName',
  },
  {
    columnId: 'processId',
    apiPropertyName: 'ProcessId',
  },
  {
    columnId: 'faaImportFileType',
    apiPropertyName: 'FaaImportFileType',
  },
  {
    columnId: 'processDate',
    apiPropertyName: 'ProcessDate',
  },
  {
    columnId: 'faaImportStatus',
    apiPropertyName: 'FaaImportStatus',
  },
  {
    columnId: 'faaMergeAllStatus',
    apiPropertyName: 'FaaMergeAllStatus',
  },
];

export const mergeStatus = {
  [FAA_MERGE_STATUS.NOT_MERGED]: 'Not Merged',
  [FAA_MERGE_STATUS.MERGED]: 'Merged',
  [FAA_MERGE_STATUS.FAILED]: 'Failed',
};

export const mergeStatusOptions: ISelectOption[] = [
  { label: mergeStatus[1], value: 1 },
  { label: mergeStatus[2], value: 2 },
  { label: mergeStatus[3], value: 3 },
];

export const comparisonType = {
  [FAA_COMPARISON_TYPE.ADDED]: 'Added',
  [FAA_COMPARISON_TYPE.MODIFIED]: 'Modified',
  [FAA_COMPARISON_TYPE.DELETED]: 'Removed',
};

export const faaImportDataFiltersMap = {
  [FAA_IMPORT_DATA_FILTERS.ALL]: null,
  [FAA_IMPORT_DATA_FILTERS.ADDED]: 1,
  [FAA_IMPORT_DATA_FILTERS.REMOVED]: 2,
  [FAA_IMPORT_DATA_FILTERS.MODIFIED]: 3,
};

export const faaImportStatusOptions: ISelectOption[] = [
  { label: 'New', value: 1 },
  { label: 'Running', value: 2 },
  { label: 'Failed', value: 3 },
  { label: 'Completed', value: 4 },
];

export const faaMergeAllStatusOptions: ISelectOption[] = [
  { label: 'Scheduled', value: 1 },
  { label: 'InProgress', value: 2 },
  { label: 'Completed', value: 3 },
  { label: 'Failed', value: 4 },
];

export const fields = {
  faaImportFileType: {
    label: 'File Type',
    rules: 'required',
  },
};

export const importFileTypeOptions: SettingsTypeModel[] = [
  new SettingsTypeModel({ name: 'Airport', id: IMPORT_FILE_TYPE.AIRPORT }),
  new SettingsTypeModel({ name: 'Frequency', id: IMPORT_FILE_TYPE.FREQUENCY }),
  new SettingsTypeModel({ name: 'Rural Airport', id: IMPORT_FILE_TYPE.RURAL_AIRPORT }),
];
