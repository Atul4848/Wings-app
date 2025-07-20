import { regex } from '@wings-shared/core';

export const fields = {
  fieldType: {
    label: 'Data Type',
    rules: 'required',
  },
  displayName: {
    label: 'Display Name',
    rules: `required|string|between:1,200|regex:${regex.alphaNumeric}`,
  },
  variableName: {
    label: 'Variable Name',
    rules: `required|string|between:1,200|regex:${regex.alphaNumericWithoutSpaces}`,
  },
  description: {
    label: 'Description',
    rules: 'string|between:1,500',
  },
  required: {
    label: 'Field required',
  },
  context: {
    label: 'Format',
  },
};
