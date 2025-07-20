import { regex } from '@wings-shared/core';

export const fields = {
  firstName: {
    label: 'First Name',
    rules: `required|string|between:1,100|regex:${regex.alphabetsWithSpaces}`,
  },
  lastName: {
    label: 'Last Name',
    rules: `required|string|between:1,100|regex:${regex.alphabetsWithSpaces}`,
  },
  email: {
    label: 'Email',
    rules: `required|min:1|regex:${regex.email}`,
  },
  username: {
    label: 'UserName',
  },
  csdUserId: {
    label: 'CsdUserId',
    rules: `required|regex:${regex.numberOnly}`,
  },
  status: {
    label: 'Status',
  },
  isInternal: {
    label: 'Is Internal',
  },
  endDate: {
    label: 'End Date',
  },
  userGuid: {
    label: 'User GUID',
  },
  role: {
    label: 'Role',
    rules: 'required',
  },
  assumedIdentity: {
    label: 'Assumed Identity',
    rules: `regex:${regex.numberOnly}`,
  },
};
