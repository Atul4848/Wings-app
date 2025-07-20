import { auditFields } from '@wings/shared';

export const fields = {
  name: {
    label: 'Name',
    rules: 'required|string|max:20',
  },
  code: {
    label: 'Code',
    rules: 'required|string|max:3',
  },
  isInternal: {
    label: 'Is Internal',
  },
  managerNameModel: {
    label: 'Manager Name',
  },
  managerEmail: {
    label: 'Manager Email',
    rules: 'string|email|between:1,50',
  },
  managerPhone: {
    label: 'Manager Phone',
    rules: 'string|between:1,50',
  },
  managerPhoneExtension: {
    label: 'Manager Phone Extension',
    rules: 'string|between:1,5',
  },
  groupEmail: {
    label: 'Group Email',
    rules: 'string|email|between:1,50',
  },
  tollFreePhone: {
    label: 'Toll Free Phone',
    rules: 'string|between:1,20',
  },
  usPhone: {
    label: 'US Phone',
    rules: 'string|between:1,50',
  },
  faxNumber: {
    label: 'Fax Number',
    rules: 'string|between:1,50',
  },
  displayOrder: {
    label: 'Display Order',
    rules: 'digits_between:1,5',
  },
  rmpEmail: {
    label: 'RMP Email',
    rules: 'string|email|between:1,50',
  },
  associatedTeamTypes: {
    label: 'Associated Team Types',
    value: [],
  },
  teamEmailComms: {
    value: [],
  },
  status: {
    label: 'Status',
  },
  ...auditFields,
};
