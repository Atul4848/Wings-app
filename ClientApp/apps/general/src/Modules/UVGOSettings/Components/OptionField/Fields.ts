import { regex } from '@wings-shared/core';

export const fields = {
  type: {
    label: 'Type*',
    rules: 'required',
  },
  value: {
    label: 'Value',
  },
  keyName: {
    label: 'Key Name*',
    rules: `required|between:1,100|regex:${regex.alphaNumericWithUnderscore_Hyphen}`,
  },
};
