import { regex } from '@wings-shared/core';

export const fields = {
  recurrenceRangeType: {
    label: 'End By*',
    rules: 'required',
  },
  startDate: {
    label: 'Start Date*',
    rules: 'required',
  },
  endDate: {
    label: 'End Date',
  },
  numberOfOccurrences: {
    label: 'End After Day(s)*',
    rules: `regex:${regex.numeric}`,
  },
};
