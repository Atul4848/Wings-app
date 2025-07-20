import { auditFields } from '@wings/shared';

export const usFields = {
  ...auditFields,
  cbpPortType: {
    label: 'CBP Port Type',
  },
  cbpFactUrl: {
    label: 'CBP Fact Sheet URL',
    rules: 'string|between:1,300',
  },
  biometricCapabilitiesForeignNationals: {
    label: 'Biometric Capabilities - Foreign Nationals',
  },
  areaPortAssignment: {
    label: 'Area Port Assignment ',
  },
  fieldOfficeOversight: {
    label: 'Field Office Oversight',
  },
  satelliteLocation: {
    label: 'Satellite Location',
  },
  driveTimeInMinutes: {
    label: 'Drive Time in Minutes',
    rules: 'integer|max:999',
  },
  preClearCustomsLocations: {
    label: 'Pre-Clear Customs Location Information',
    value: [],
  },
  clearanceFBOs: {
    label: 'Pre-Clear Clearance FBOs',
  },
  preClearClearanceLocation: {
    label: 'Pre-Clear Clearance Location Specifics',
    rules: 'string|between:1,200',
  },
  preClearanceDocuments: {
    label: 'Pre-Clear Documents Required',
    value: [],
  },
  preClearRequiredInformation: {
    label: 'Pre-Clear Required Information ',
    rules: 'string|between:1,300',
  },
  isPreClearInternationalTrash: {
    label: 'Pre-Clear International Trash',
  },
  preClearUWAProcessNotes: {
    label: 'Pre-Clear UWA Process Notes',
    rules: 'string|between:1,400',
  },
  preClearCustomsClearanceProcess: {
    label: 'Pre-Clear Customs Clearance Process',
    rules: 'string|between:1,2000',
  },
  preClearSpecialInstruction: {
    label: 'Pre-Clear Special Instructions',
    rules: 'string|between:1,500',
  },
  reimbursableServicesProgram: {
    fields: {
      subscribedAirport: {
        label: 'RSP Subscribed Airport',
      },
      instructions: {
        label: 'RSP Instructions',
        rules: 'string|between:1,1000',
      },
      contact: {
        label: 'RSP Contact',
      },
    },
  },
};
