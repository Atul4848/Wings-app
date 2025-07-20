import { regex } from '@wings-shared/core';

export const fields = {
  name: {
    label: 'Application Name',
    rules: `required|between:1,100|regex:${regex.alphaNumericWithUnderscore_Hyphen_Space}`,
  },
  oktaClientId: {
    label: 'Okta Clients',
  },
};
