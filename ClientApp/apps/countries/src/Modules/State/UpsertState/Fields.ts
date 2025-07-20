import { regex, formOptions } from '@wings-shared/core';
import { ModelStatusOptions, auditFields } from '@wings/shared';

export const fields = {
  country: {
    label: 'Country*',
    rules: 'required',
  },
  code: {
    label: 'State Code*',
    rules: `required|string|between:1,3|regex:${regex.alphaNumeric}`,
  },
  isoCode: {
    label: 'ISO Code*',
    rules: `required|string|between:1,6|regex:${regex.statecode}`,
  },
  stateType: {
    label: 'State Type*',
    rules: 'required',
  },
  commonName: {
    label: 'Common Name*',
    rules: 'required|string|between:1,100',
  },
  officialName: {
    label: 'Official Name*',
    rules: 'required|between:1,100',
  },
  cappsCode: {
    label: 'CAPPS Code',
    rules: 'string|between:1,2',
  },
  cappsName: {
    label: 'CAPPS Name',
    rules: 'string|between:1,50',
  },
  syncToCAPPS: {
    label: 'Sync To CAPPS',
    options: formOptions,
  },
  accessLevel: {
    label: 'Access Level*',
    rules: 'required',
    placeholder: 'Search Access Level',
  },
  status: {
    label: 'Status*',
    options: ModelStatusOptions,
    rules: 'required',
  },
  startDate: {
    label: 'Start Date',
  },
  endDate: {
    label: 'End Date',
  },
  sourceType: {
    label: 'Source Type',
    placeholder: 'Search Source Type',
  },
  ...auditFields,
};
