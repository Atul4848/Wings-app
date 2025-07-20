import { baseGridFiltersDictionary } from '@wings/shared';
import { IAPIFilterDictionary, ISelectOption } from '@wings-shared/core';
import { DECAL_IMPORT_STATUS, IMPORT_CUSTOMS_DECAL_FILTER } from '../Shared';

export const gridFilters: IAPIFilterDictionary<IMPORT_CUSTOMS_DECAL_FILTER>[] = [
  ...baseGridFiltersDictionary<IMPORT_CUSTOMS_DECAL_FILTER>(),
  {
    columnId: 'customsDecalImportFileStatus',
    apiPropertyName: 'CustomsDecalImportFileStatus',
    uiFilterType: IMPORT_CUSTOMS_DECAL_FILTER.STATUS,
  },
  { columnId: 'blobName', apiPropertyName: 'BlobName',  uiFilterType: IMPORT_CUSTOMS_DECAL_FILTER.NAME, },
  { columnId: 'processDate', apiPropertyName: 'ProcessDate' },
];

export const statusOptions: ISelectOption[] = [
  { label: DECAL_IMPORT_STATUS.NEW, value: 1 },
  { label: DECAL_IMPORT_STATUS.INPROGRESS, value: 2 },
  { label: DECAL_IMPORT_STATUS.COMPLETED, value: 3 },
  { label: DECAL_IMPORT_STATUS.FAILED, value: 4 },
];

export const fields = {
  decalImportYear: {
    label: 'Year',
    rules: 'required',
  },
};