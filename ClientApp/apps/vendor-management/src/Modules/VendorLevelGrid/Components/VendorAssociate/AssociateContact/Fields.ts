import { auditFields } from '@wings/shared';

export const fields = {
  ...auditFields,
  id: {
    label: 'Contact Id',
  },
  contact: {
    label: 'Contact*',
    rules: 'required',
  },
  contactUsegeType: {
    label: 'Usage Type*',
    rules: 'required',
  },
  status: {
    label: 'Status*',
    rules: 'required',
  },
  accessLevel: {
    label: 'Access Level*',
    rules: 'required',
  },
};

export const locationField={
  ...fields,
  vendorLocationIds: {
    label: 'Contact Location*',
    rules:'required',
    value: []
  }
}

