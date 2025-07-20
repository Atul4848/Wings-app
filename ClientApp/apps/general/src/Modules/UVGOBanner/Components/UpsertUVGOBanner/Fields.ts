import { regex } from '@wings-shared/core';

export const fields = {
  effectiveStartDate: {
    label: 'UTC Start Date*',
    rules: 'required',
  },
  effectiveEndDate: {
    label: 'UTC End Date*',
    rules: 'required',
  },
  message: {
    label: 'Message*',
    rules: 'required|string|between:1,2000',
  },
  bannerType: {
    label: 'Type*',
    rules: 'required',
  },
  bannerService: {
    label: 'Service*',
    rules: 'required',
  },
  embeddedLink: {
    label: 'Embedded Link',
    rules: `regex:${regex.embeddedLink}`,
  },
};
