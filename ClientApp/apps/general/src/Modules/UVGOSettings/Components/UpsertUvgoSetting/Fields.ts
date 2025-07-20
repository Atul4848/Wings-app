import { regex } from '@wings-shared/core';

export const fields = {
  id: {
    label: 'Key*',
    rules: `required|between:1,100|regex:${regex.alphaNumericWithUnderscore_Hyphen}`,
  },
  assemblyName: {
    label: 'Assembly Name*',
    rules: `required|between:1,100|regex:${regex.alphabetsWithDot}`,
  },
  name: {
    label: 'Name*',
    rules: 'required',
  },
  area: {
    label: 'Area*',
    rules: 'required',
  },
  settingType: {
    label: 'Set Type*',
    rules: 'required',
  },
  description: {
    label: 'Description',
    rules: 'between:1,100',
  },
  cronExpression: {
    label: 'CronExpression*',
  },
};
  