import { auditFields, ModelStatusOptions } from '@wings/shared';

export const fields = {
  name: {
    label: 'Name*',
    rules: 'required|string|between:1,100',
  },
  country: {
    label: 'Country*',
    placeHolder: 'Country',
    rules: 'required',
  },
  state: {
    label: 'State',
    placeHolder: 'Select State',
  },
  status: {
    label: 'Status*',
    options: ModelStatusOptions,
    rules: 'required',
  },
  accessLevel: {
    label: 'Access Level*',
    rules: 'required',
  },
  sourceType: {
    label: 'Source Type',
  },
  ...auditFields,
};
