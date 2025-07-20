import { baseGridFiltersDictionary } from '@wings/shared';
import { COUNTRY_FILTERS } from '../Shared';
import { IAPIFilterDictionary } from '@wings-shared/core';

export const countryGridFilters: IAPIFilterDictionary<COUNTRY_FILTERS>[] = [
  ...baseGridFiltersDictionary<COUNTRY_FILTERS>(),
  {
    columnId: 'commonName',
    apiPropertyName: 'CommonName',
    uiFilterType: COUNTRY_FILTERS.COMMONNAME,
  },
  {
    columnId: 'officialName',
    apiPropertyName: 'OfficialName',
    uiFilterType: COUNTRY_FILTERS.OFFICIALNAME,
  },
  {
    columnId: 'isO2Code',
    apiPropertyName: 'ISO2Code',
    uiFilterType: COUNTRY_FILTERS.ISO2CODE,
  },
  {
    columnId: 'isO3Code',
    apiPropertyName: 'ISO3Code',
    uiFilterType: COUNTRY_FILTERS.ISO3Code,
  },
  {
    columnId: 'sovereignCountry',
    apiPropertyName: 'SovereignCountry.Name',
    uiFilterType: COUNTRY_FILTERS.SOVEREIGN_COUNTRY,
  },
  {
    columnId: 'isTerritory',
    apiPropertyName: 'IsTerritory',
  },
];
