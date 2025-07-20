import { regex } from '@wings-shared/core';

export const fields = {
  name: {
    label: 'Name*',
    rules: `required|between:1,200|regex:${regex.alphaNumeric}`,
  },
  startTime: {
    label: 'UTC Start Time*',
    rules: 'required',
  },
  stopTime: {
    label: 'UTC Stop Time*',
    rules: 'required',
  },
  level: {
    label: 'Message Level',
    rules: 'required',
  },
  filterType: {
    label: 'Filter Type',
    rules: 'required',
  },
  eventTypes: {
    label: 'Event Types*',
    rules: 'required',
  },
  deliveryTypes: {
    label: 'Delivery Types*',
    rules: 'required',
  },
  oktaUser: {
    label: 'Okta User*',
    rules: 'required',
  },
  isEnabled: {
    label: 'Is Enabled',
  },
  daysOfWeek: {
    label: 'Days of Week*',
    rules: 'required',
  },
};
