import { auditFields } from '@wings/shared';

export const fields = {
  authorizationLevel: {
    label: 'Authorization Level*',
    rules: 'required',
  },
  infectionType: {
    label: 'Disease or Virus*',
    rules: 'required',
  },
  affectedType: {
    label: 'Affected Type*',
    rules: 'required',
  },
  region: {
    label: 'Nationality Affected Region',
  },
  healthAuthorizationExcludedNationalities: {
    label: 'Nationality Excluded',
    value:[]
  },
  levelDesignator: {
    label: 'Level Designator*',
    rules: 'required',
  },
  healthAuthTraveledCountries: {
    label: 'Traveled Country*',
    rules: 'required',
    value:[]
  },
  healthAuthorizationExcludedTraveledCountries: {
    label: 'Traveled Countries excluded',
    value:[]
  },
  healthAuthNationalities: {
    label: 'Nationality Affected*',
    rules: 'required',
    value:[]
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
  receivedBy: {
    label: 'Received By*',
    rules: 'required|string|between:1,50',
  },
  receivedDate: {
    label: 'Vendor Survey Last Update Date*',
    rules: 'required|date',
  },
  requestedBy: {
    label: 'Requested By',
    rules: 'string|between:1,50',
  },
  requestedDate: {
    label: 'Vendor Survey Start Date',
  },
  isSuspendNotification: {
    label: 'Suspend Automated Email Creation',
  },
  statusChangeReason: {
    label: 'Status Change Reason',
    rules: 'string|between:1,50',
  },
  daysCountToReceivedDate: {
    label: 'Vendor Survey Occurrence*',
    rules: 'integer|required|min:1|max:365',
  },
  daysCountToRequestedDate: {
    label: 'Vendor Survey Follow up (Days)*',
    rules: 'integer|required|min:1|max:365',
  },
  ...auditFields,
};
