import { regex } from '@wings-shared/core';

export const fields = {
  time: {
    label: 'Start Time',
    placeholder: 'Select Start Time',
  },
  solarTime: {
    label: 'Sunset/ Sunrise*',
    rules: 'required',
    placeholder: 'Select Sunset/ Sunrise',
  },
  offSet: {
    label: 'Offset (minutes)',
    rules: `regex:${regex.negativeNumber}`,
    placeholder: 'Offset (minutes)',
  },
};
