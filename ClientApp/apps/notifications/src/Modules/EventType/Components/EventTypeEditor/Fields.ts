import { regex } from '@wings-shared/core';

export const fields = {
  name: {
    label: 'Name*',
    rules: `required|string|between:1,200|regex:${regex.alphaNumericWithUnderscore}`,
  },
  category: {
    label: 'Category*',
    rules: 'required',
  },
  subCategory: {
    label: 'Sub Category',
  },
  publicEnabled: {
    label: 'Is Public Enabled',
  },
  systemEnabled: {
    label: 'Is System Enabled',
  },
  description: {
    label: 'Description',
    rules: 'string|between:1,500',
  },
};
