import { regex, formOptions } from '@wings-shared/core';
import { ModelStatusOptions, auditFields } from '@wings/shared';

export const fields = {
  officialName: {
    label: 'Official Name*',
    rules: 'required|string|between:1,100',
  },
  commonName: {
    label: 'Common Name',
    rules: 'string|between:1,100',
  },
  isO2Code: {
    label: 'ISO (2) Code*',
    rules: `required|string|between:1,2|regex:${regex.alphabetsWithSpaces}`,
  },
  isO3Code: {
    label: 'ISO (3) Code*',
    rules: `required|string|between:1,3|regex:${regex.alphabetsWithSpaces}`,
  },
  isTerritory: {
    label: 'Is Territory',
    options: formOptions,
  },
  territoryType: {
    label: 'Territory Type',
    placeholder: 'Search Territory Type',
  },
  sovereignCountry: {
    label: 'Sovereignty',
    placeholder: 'Search Sovereignty',
  },
  currencyCode: {
    label: 'Currency Code',
    rules: 'string|between:1,3',
  },
  commsPrefix: {
    label: 'Comms Prefix',
    options: [
      { label: '1', value: '1' },
      { label: '011', value: '011' },
    ],
  },
  isoNumericCode: {
    label: 'ISO Numeric*',
    rules: `required|numeric|between:1,999|regex:${regex.numberOnly}`,
  },
  continent: {
    label: 'Continent*',
    rules: 'required',
    placeholder: 'Search Continent',
  },
  geographicalRegion: {
    label: 'Geographic Region*',
    rules: 'required',
    placeholder: 'Search Geographic Region',
  },
  capitalCity: {
    label: 'Capital City',
    placeholder: 'Search Capital City',
  },
  postalCodeFormat: {
    label: 'Postal Code Format',
    options: formOptions,
  },
  cappsCountryName: {
    label: 'CAPPS Country Name',
    rules: 'string|between:1,25',
  },
  cappsusSanctionType: {
    label: 'CAPPS Sanction Type',
    rules: 'string|max:1',
  },
  cappsShortDescription: {
    label: 'CAPPS Short Name',
    rules: 'string|between:1,100',
  },
  cappsRegistryIdentifier: {
    label: 'CAPPS Registry Identifier',
    rules: 'string|between:1,20',
  },
  cappsusSanction: {
    label: 'CAPPS Sanctions',
    options: formOptions,
  },
  status: {
    label: 'Status*',
    options: ModelStatusOptions,
    rules: 'required',
  },
  cappsTerritoryType: {
    label: 'CAPPS Territory Type',
  },
  startDate: {
    label: 'Start Date',
  },
  endDate: {
    label: 'End Date',
  },
  securityThreatLevel: {
    label: 'Security Threat Level',
  },
  accessLevel: {
    label: 'Access Level*',
    rules: 'required',
    placeholder: 'Search Access Level',
  },
  sourceType: {
    label: 'Source Type*',
    rules: 'required',
    placeholder: 'Search Source Type',
  },
  ...auditFields,
};
