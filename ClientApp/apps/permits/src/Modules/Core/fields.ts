import { baseGridFiltersDictionary } from '@wings/shared';
import { PERMIT_FILTERS } from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const permitsGridFilters: IAPIFilterDictionary<PERMIT_FILTERS>[] = [
  ...baseGridFiltersDictionary<PERMIT_FILTERS>(),
  {
    columnId: 'country',
    apiPropertyName: 'Country.Name',
    uiFilterType: PERMIT_FILTERS.COUNTRY,
  },
  {
    columnId: 'permitType',
    apiPropertyName: 'PermitType.Name',
  },
  {
    columnId: 'isRequired',
    apiPropertyName: 'IsRequired',
  },
  {
    columnId: 'isException',
    apiPropertyName: 'IsException',
  },
  {
    columnId: 'exception',
    apiPropertyName: 'Exception',
  },
  {
    columnId: 'permitApplied.permitAppliedTo',
    apiPropertyName: 'PermitApplieds.PermitAppliedTo.Name',
  },
  {
    columnId: 'permitApplied.extendedByNM',
    apiPropertyName: 'PermitApplieds.ExtendedByNM',
  },
  {
    columnId: 'permitApplied.isPolygon',
    apiPropertyName: 'PermitApplieds.IsPolygon',
  },
  {
    columnId: 'countryISO2',
    apiPropertyName: 'Country.Code',
    uiFilterType: PERMIT_FILTERS.ISO2CODE,
  },
];
