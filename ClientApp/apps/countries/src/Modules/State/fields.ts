import { baseGridFiltersDictionary } from '@wings/shared';
import { STATE_FILTERS } from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const stateGridFilters: IAPIFilterDictionary<STATE_FILTERS>[] = [
  ...baseGridFiltersDictionary<STATE_FILTERS>(),
  { columnId: 'officialName', apiPropertyName: 'OfficialName', uiFilterType: STATE_FILTERS.OFFICIAL_NAME },
  { columnId: 'country', apiPropertyName: 'Country.Code', uiFilterType: STATE_FILTERS.COUNTRY_CODE },
  { columnId: 'code', apiPropertyName: 'Code', uiFilterType: STATE_FILTERS.STATE_CODE },
  { columnId: 'isoCode', apiPropertyName: 'ISOCode', uiFilterType: STATE_FILTERS.ISO_STATE_CODE },
  { columnId: 'stateType', apiPropertyName: 'StateType.Name', uiFilterType: STATE_FILTERS.STATE_TYPE },
  { columnId: 'commonName', apiPropertyName: 'CommonName', uiFilterType: STATE_FILTERS.COMMON_NAME },
  { columnId: 'cappsCode', apiPropertyName: 'CappsCode', uiFilterType: STATE_FILTERS.CAPPS_CODE },
  { columnId: 'cappsName', apiPropertyName: 'CappsName', uiFilterType: STATE_FILTERS.CAPPS_NAME },
  { columnId: 'syncToCAPPS', apiPropertyName: 'SyncToCAPPS' },
  { columnId: 'startDate', apiPropertyName: 'StartDate' },
  { columnId: 'endDate', apiPropertyName: 'EndDate' },
  { columnId: 'sourceType', apiPropertyName: 'SourceType.Name' },
];
