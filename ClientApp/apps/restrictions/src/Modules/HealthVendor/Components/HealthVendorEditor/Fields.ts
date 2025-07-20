import { auditFields } from '@wings/shared';

export const fields = {
  authorizationLevel: {
    label: 'Vendor Level*',
    rules: 'required',
  },
  vendorLevelEntity: {
    label: 'Vendor Level Entity',
  },
  name: {
    label: 'Name',
    rules: 'required|string|between:1,100',
  },
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
  surveyLink: {
    rules: 'string|between:1,200',
  },
  ...auditFields,
}
