import { auditFields } from '@wings/shared';

export const fields = {
  format: {
    label: 'Format*',
    rules: 'required|string|between:1,2',
  },
  flightPlanFormatStatus: {
    label: 'Assignment*',
    rules: 'required',
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
  requestBy: {
    label: 'Requested By',
    rules: 'string|between:1,100',
  },
  contactForChanges: {
    label: 'Contact For Changes',
    rules: 'string|between:1,500',
  },
  notes: {
    label: 'Notes',
    rules: 'string|between:1,500',
  },
  builtBy: {
    label: 'Build By',
    rules: 'string|between:1,100',
  },
  builtDate: {
    label: 'Build Date',
  },
  lastUsedDate: {
    label: 'Last Used Date',
  },
  includeEscapeRoutes: {
    label: 'Includes Escape Routes',
  },
  flightPlanFormatAccounts: {
    label: 'FlightPlan Format Accounts',
    value: [],
  },
  flightPlanFormatChangeRecords: {
    label: 'FlightPlan Format Change Records',
    value: [],
  },
  flightPlanFormatDocuments: {
    label: 'FlightPlan Format Documents',
    value: [],
  },
  ...auditFields,
};
