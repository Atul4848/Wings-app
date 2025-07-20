import { auditFields } from '@wings/shared';

export const fields = {
  code: { label: 'Policy Code*', rules: 'required|string|between:1,2' },
  description: { label: 'Description', rules: 'string|between:1,200' },
  comments: { label: 'Comment', rules: 'string|between:1,500' },
  etpScenarios: { label: 'Etp Scenarios*', rules: 'required' },
  accessLevel: {
    label: 'Access Level*',
    rules: 'required',
  },
  sourceType: {
    label: 'Source Type',
  },
  status: {
    label: 'Status*',
    rules: 'required',
  },
  ...auditFields,
};
