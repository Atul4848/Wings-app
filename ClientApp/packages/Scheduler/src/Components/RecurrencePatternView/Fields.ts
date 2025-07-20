import { regex } from '@wings-shared/core';

export const fields = {
  interval: {
    label: 'Every Day(s)*',
    placeholder: 'interval',
    rules: `required|regex:${regex.numeric}`,
    type: 'number',
  },
  dayOfMonth: {
    label: 'On Day',
    placeholder: 'Day of Month',
    rules: 'integer',
  },
  recurrencePatternTypeId: {
    label: 'Month Type*',
    rules: 'required',
  },
  // Weekly
  daysOfWeeks: {
    label: 'Week Days',
    placeholder: 'Week Days',
    value: [],
  },
  // Monthly
  weekIndexId: {
    label: 'On Week',
    placeholder: 'week index',
  },
  firstDayOfWeekId: {
    label: 'On Day',
    placeholder: 'Select Day Of Week',
  },
  // Yearly
  month: {
    label: 'Of Month',
    placeholder: 'Select Month',
  },
};
