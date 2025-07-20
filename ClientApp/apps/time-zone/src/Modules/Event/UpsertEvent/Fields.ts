import { regex } from '@wings-shared/core';
import { auditFields } from '@wings/shared';
export const fields = {
  ...auditFields,
  name: {
    label: 'Name*',
    rules: 'required|string|between:1,100',
  },
  description: {
    label: 'Description',
    rules: 'string|between:1,100',
  },
  eventCategory: {
    label: 'Category*',
    rules: 'required',
  },
  eventType: {
    label: 'Type',
  },
  specialConsiderations: {
    label: 'Special Consideration',
    value: [],
  },
  uaOffice: {
    label: 'UA Location',
  },
  url: {
    label: 'URL',
    rules: `string|between:1,500|regex:${regex.urlV2}`,
  },
  beginPlanning: {
    label: 'Begin Planning',
    rules: 'numeric|between:0,365',
  },
  country: {
    label: 'Country',
  },
  region: {
    label: 'Region*',
    rules: 'required',
  },
  states: {
    label: 'States',
    value: [],
  },
  cities: {
    label: 'Cities',
    value: [],
  },
  airports: {
    label: 'Airports',
    value: [],
  },
  eventSchedule: {
    fields: {
      startDate: {
        label: 'Start Date',
        rules: 'required',
      },
      endDate: { label: 'End Date' },
      startTime: {
        fields: {
          time: { label: 'Start Time' },
        },
      },
      endTime: {
        fields: {
          time: { label: 'End Time' },
        },
      },
      is24Hours: { label: 'Is 24 Hours' },
      isRecurrence: { label: 'Is Recurrence' },
      recurrenceMessage: { label: 'Recurrence Message' },
    },
  },
  notes: {
    label: 'Notes',
    rules: 'string|between:1,1000',
  },
  isMajorEvent: {
    label: 'Major Event',
    value: false,
  },
  accessLevel: {
    label: 'Access Level*',
    rules: 'required',
  },
  status: {
    label: 'Status*',
    rules: 'required',
  },
  sourceType: {
    label: 'Source Type',
  },
};
