import { baseGridFiltersDictionary } from '@wings/shared';
import { EVENT_IMPORT_STATUS, IMPORT_STATUS_FILTER } from '../../Shared';
import { IAPIFilterDictionary, ISelectOption, StatusTypeModel } from '@wings-shared/core';

export const importEventsGridFilters: IAPIFilterDictionary<IMPORT_STATUS_FILTER>[] = [
  ...baseGridFiltersDictionary<IMPORT_STATUS_FILTER>(),
  {
    columnId: 'worldEventImportStatus',
    apiPropertyName: 'WorldEventImportStatus',
    uiFilterType: IMPORT_STATUS_FILTER.STATUS,
  },
  { columnId: 'blobName', apiPropertyName: 'BlobName',  uiFilterType: IMPORT_STATUS_FILTER.NAME, },
  { columnId: 'processDate', apiPropertyName: 'ProcessDate' },
];

export const status= {
  1: EVENT_IMPORT_STATUS.PROCESSING,
  2: EVENT_IMPORT_STATUS.COMPLETED,
  3: EVENT_IMPORT_STATUS.FAILURE,
};

export const statusOptions: ISelectOption[] = [
  { label: EVENT_IMPORT_STATUS.PROCESSING, value: 1 },
  { label: EVENT_IMPORT_STATUS.COMPLETED, value: 2 },
  { label: EVENT_IMPORT_STATUS.FAILURE, value: 3 },
];
