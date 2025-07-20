export const fields = {
  bulletinLevel: {
    label: 'Bulletin Level*',
    rules: 'required',
    placeholder: 'Select Bulletin Level',
  },
  country: {
    label: 'Country',
    placeholder: 'Select Country',
  },
  state: {
    label: 'State',
    placeholder: 'Select State',
  },
  bulletinEntity: {
    label: 'Bulletin Entity*',
    rules: 'required',
    placeholder: 'Select Bulletin Entity',
  },
  vendorLocationAirport: {
    label: 'Airport',
  },
  startDate: {
    label: 'Start Date*',
    rules: 'required',
  },
  endDate: {
    label: 'End Date*',
    rules: 'required',
  },
  isUFN: {
    label: 'IsUFN',
  },
  runTripChecker: {
    label: 'Run Trip Checker',
  },
  appliedBulletinTypes: {
    label: 'Bulletin Types*',
    rules: 'required',
  },
  bulletinPriority: {
    label: 'Bulletin Priority*',
    rules: 'required',
  },
  bulletinText: {
    label: 'Bulletin Text',
    rules: 'string|max:8000',
  },
  internalNotes: {
    label: 'Internal Notes',
    rules: 'string|max:8000',
  },
  sourceNotes: {
    label: 'Source Notes',
    rules: 'string|max:4000',
  },
  dmNotes: {
    label: 'DM Notes',
    rules: 'string|max:2000',
  },
  notamNumber: {
    label: 'Notam Id',
    rules: 'string|max:20',
  },
  uaOffice: {
    label: 'UA Office',
    placeholder: 'Select UA Office',
  },
  vendorName: {
    label: 'Vendor Name',
    rules: 'string|between:3,200',
  },
  bulletinCAPPSCategory: {
    label: 'CAPPS Category Code',
    rules: 'required',
  },
  bulletinSource: {
    label: 'Source',
    placeholder: 'Select Source',
  },
  accessLevel: {
    label: 'Access Level',
    rules: 'required',
    placeholder: 'Select Access Level',
  },
  status: {
    label: 'Status',
    placeholder: 'Select Status',
  },
  createdBy: {
    label: 'Created By',
  },
  createdOn: {
    label: 'Created Date',
  },
  modifiedBy: {
    label: 'Updated By',
  },
  modifiedOn: {
    label: 'Updated Date',
  },
  syncToCAPPS: {
    label: 'Sync to Capps',
  },
};
