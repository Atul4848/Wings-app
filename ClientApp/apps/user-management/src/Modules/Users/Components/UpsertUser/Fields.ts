import { regex } from '@wings-shared/core';

export const fields = {
  firstName: {
    label: 'First Name',
    rules: 'required',
  },
  lastName: {
    label: 'Last Name',
    rules: 'required',
  },
  username: {
    label: 'Username',
    rules: `required|regex:${regex.email}`,
  },
  email: {
    label: 'Email',
    rules: `required|regex:${regex.email}`,
  },
  id: {
    label: 'User GUID',
  },
  endDate: {
    label: 'End Date',
  },
  userId: {
    label: 'OKTA User ID',
  },
  status: {
    label: 'Status',
  },
  provider: {
    label: 'Provider',
  },
  csdUsername: {
    label: 'Legacy CSD User',
  },
  oracleUser: {
    label: 'Oracle User',
  },
  assumeIdentity: {
    label: 'Assume Identity',
  },
  isEmailVerified: {
    label: 'Email Verified',
  },
  sendActivationEmail: {
    label: 'Send Activation Email',
  },
  generateTempPassword: {
    label: 'Generate Temporary Password',
  },
  wings: {
    label: 'Wings', 
  },
  uvGO: {
    label: 'uvGO',
  },
  serviceManagement: {
    label: 'Service Management',
  },
  uplinkUI: {
    label: 'Uplink UI',
  },
  ciscoUsername: {
    label: 'Cisco Username'
  }
};
