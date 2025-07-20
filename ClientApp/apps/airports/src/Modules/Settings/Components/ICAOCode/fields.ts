import { baseGridFiltersDictionary } from '@wings/shared';
import { ICAO_CODE_FILTER } from '../../../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const icaoGridFilters: IAPIFilterDictionary<ICAO_CODE_FILTER>[] = [
  ...baseGridFiltersDictionary<ICAO_CODE_FILTER>(),
  { columnId: 'code', apiPropertyName: 'Code', uiFilterType: ICAO_CODE_FILTER.ICAO },
];
