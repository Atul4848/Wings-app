import { regex } from '@wings-shared/core';

export const fields = {
  name: {
    label: 'Name*',
    rules: `required|string|between:1,200|regex:${regex.alphaNumericWithUnderscore}`,
  },
  deliveryType: {
    label: 'Delivery Type*',
    rules: 'required',
  },
  channel: {
    label: 'Channel Type*',
    rules: 'required',
  },
  eventType: {
    label: 'Event Type*',
    rules: 'required',
  },
  content: {
    label: 'Content*',
  },
  description: {
    label: 'Description',
    rules: 'string|between:1,500',
  },
  defaultTemplate: {
    label: 'Is Default',
  },
  emailContent: {
    label: 'Content*',
  },
  subject: {
    label: 'Subject*',
    rules: 'required|string|between:1,200',
  },
  useSendGrid: {
    label: 'Use Send Grid',
  },
  sendGridTemplateId: {
    label: 'SendGrid Template Id',
  },
};
