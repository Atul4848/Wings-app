import { regex } from '@wings-shared/core';

export const fields = {
  name: {
    label: 'Service Name',
    validators: ({ field, form }) => {
      return [
        Boolean(field.value) ? regex.lowerCaseWithUnderscore.test(field.value) : true,
        'Use only lowercase letters and underscores.',
      ];
    },
  },
  displayName: {
    label: 'Display Name',
    rules: `required|between:1,100|regex:${regex.alphaNumericWithUnderscore_Hyphen_Space}`,
  },
  description: {
    label: 'Description',
    rules: 'required',
  },
  applicationName: {
    label: 'Application Name',
  },
  enabled: {
    label: 'Enabled',
  },
};
