import { auditFields } from '@wings/shared';
export const fields = {
  ...auditFields,
  permissionType: {
    label: 'Permission Type',
    rules: 'required',
  },
  notificationType: {
    label: 'Notification Type',
  },
  startDate: {
    label: 'Start Date',
    rules: 'required',
  },
  endDate: {
    label: 'End Date',
  },
  formLink: {
    label: 'Form Link',
    rules: 'string|between:1,2048',
  },
  templateID: {
    label: 'Template ID',
    rules: 'string|between:1,100',
  },
  idNumberItem18Format: {
    label: 'ID/Number Item 18 Format',
    rules: 'string',
  },
  idNumberIssued: {
    label: 'ID/Number Issued',
  },
  idNumberRequiredInFlightPlan: {
    label: 'ID/Number Required In Flight Plan',
  },
  slotAndPPRJointApproval: {
    label: 'Slot And PPR Joint Approval',
  },
  documentsRequired: {
    label: 'Documents Required',
  },
  specialFormsRequired: {
    label: 'Special Forms Required',
  },
  tbAorOpenScheduleAllowed: {
    label: 'TBA Or Open Schedule Allowed',
  },
  gabaNightSlotsAvailable: {
    label: 'GA/BA Night Slots Available',
  },
  gabaPeakHourSlotsAvailable: {
    label: 'GA/BA Peak Hour Slots Available',
  },
  airportGABAMaxArrivalSlotsPerDay: {
    label: 'Airport GA/BA Max Arrival Slots Per Day',
    rules: 'digits_between:1,3',
  },
  airportGABAMaxDepartureSlotsPerDay: {
    label: 'Airport GA/BA Max Departure Slots Per Day',
    rules: 'digits_between:1,3',
  },
  confirmationRequiredFors: {
    label: 'Confirmation Required For',
    value: [],
  },
  permissionRequiredFors: {
    label: 'Required For',
    rules: 'required',
    value: [],
  },
  pprPurposes: {
    label: 'PPR Purpose',
    value: [],
  },
  documents: {
    label: 'Documents',
    value: [],
  },
  permissionVendors: {
    label: 'Vendors',
    value: [],
  },
  permissionExceptions: {
    value: [],
  },
  permissionLeadTimes: {
    value: [],
  },
  permissionTolerances: {
    value: [],
  },
  accessLevel: {
    label: 'Access Level',
    rules: 'required',
  },
  status: {
    label: 'Status',
    rules: 'required',
  },
  sourceType: {
    label: 'Source Type',
  },
};
