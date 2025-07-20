import { regex } from '@wings-shared/core';

export const fields = {
  version: {
    label: 'Version*',
    rules: `required|min:1|regex:${regex.softwareVersion}`,
  },
  date: {
    label: 'Date*',
    rules: 'required',
  },
  forceUpdate: {
    label: 'Force Update',
  },
};
  