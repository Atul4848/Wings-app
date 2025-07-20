import { regex } from '@wings-shared/core';

export const fields = {
  name: {
    label: 'Role Name',
    validators: ({ field }) => {
      return [
        Boolean(field.value) ? regex.lowerCaseWithUnderscore.test(field.value) : true,
        'Use only lowercase letters and underscores.',
      ];
    },
  },
  type: {
    label: 'Role Type',
    rules: 'required',
  },
  displayName: {
    label: 'Display Name',
    rules: `required|between:1,100|regex:${regex.alphaNumericWithUnderscore_Hyphen_Space}`,
  },
  description: {
    label: 'Description',
    rules: 'required',
  },
  permissions: {
    label: 'Permissions',
  },
  enabled: {
    label: 'Role Enabled',
  },
};
  