import { regex } from '@wings-shared/core';
import { ModelStatusOptions, auditFields } from '@wings/shared';

/* istanbul ignore next */
export const fields = {
  ...auditFields,
  officialName: {
    label: 'Official Name*',
    rules: 'required|string|between:1,100',
  },
  commonName: {
    label: 'Common Name*',
    rules: 'required|string|between:1,100',
  },
  cappsCode: {
    label: 'CAPPS Code',
    rules: `string|between:1,3|regex:${regex.alphaNumeric}`,
  },
  cappsName: {
    label: 'CAPPS Name',
    rules: 'string|between:1,25',
  },
  cappsShortName: {
    label: 'CAPPS Short Name',
    rules: 'string|between:1,20',
  },
  country: {
    label: 'Country*',
    rules: 'required',
    placeHolder: 'Select Country',
  },
  state: {
    label: 'State',
    placeHolder: 'Select State',
  },
  latitude: {
    label: 'Latitude',
    validators: ({ field, form }) => {
      return [ Boolean(field.value) ? regex.latitude.test(field.value) : true, 'The Latitude format is invalid.' ];
    },
  },
  longitude: {
    label: 'Longitude',
    validators: ({ field, form }) => {
      return [ Boolean(field.value) ? regex.longitude.test(field.value) : true, 'The Longitude format is invalid.' ];
    },
  },
  metro: {
    label: 'Metro',
  },
  cityAlternateNames: {
    label: 'City Alternate Names',
    validators: ({ field, form }) => {
      const value = Array.isArray(field.value) ? field.value.find(value => Boolean(value?.trim().length > 200)) : null;
      return [ !Boolean(value), 'Each chip value must be between 1 and 200.' ];
    },
  },
  population: {
    label: 'Population',
    rules: `regex:${regex.populationRange}`,
  },
  ranking: {
    label: 'Ranking',
    rules: 'numeric|between:1,2147483647',
  },
  accessLevel: {
    label: 'Access Level*',
    rules: 'required',
  },
  status: {
    label: 'Status*',
    options: ModelStatusOptions,
    rules: 'required',
  },
  sourceType: {
    label: 'Source Type',
  },
};
