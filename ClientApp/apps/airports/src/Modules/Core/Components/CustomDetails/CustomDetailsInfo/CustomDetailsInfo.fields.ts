import { SelectOption } from '@wings-shared/core';

export const customDetailFields = {
  canPassPermitLocation: {
    label: 'CANPASS Program Location',
  },
  customsDocumentRequirements: {
    label: 'Documents Requirements',
    value: [],
  },
  customsRequiredInformationTypes: {
    label: 'Required Information',
    value: [],
  },
  tolerancePlus: {
    label: 'Tolerance(+)',
    rules: 'digits_between:1,3',
  },
  toleranceMinus: {
    label: 'Tolerance(-)',
    rules: 'digits_between:1,3',
  },
  uwaInternalProcessNotes: {
    label: 'UWA Internal Process Notes',
    rules: 'between:0,500',
  },
  customClearanceProcess: {
    label: 'Custom Clearance Process(External)',
    rules: 'between:0,2000',
  },
  specialInstructions: {
    label: 'Special Instructions',
    rules: 'between:0,500',
  },
  customsLeadTimes: {
    value: [],
  },
  notes: {
    value: [],
  },
  internationalTrashAvailable: {
    label: 'International Trash Available',
  },
  trashRemovalVendor: {
    label: 'Trash Removal Vendor',
    rules: 'max:200',
  },
  trashRemovalRequestTemplate: {
    label: 'Trash Removal Request Template',
    rules: 'max:50',
  },
};

export const typeCodeOptions: SelectOption[] = [
  new SelectOption({ name: 'C', value: 'C' }),
  new SelectOption({ name: 'I', value: 'I' }),
  new SelectOption({ name: 'R', value: 'R' }),
];
