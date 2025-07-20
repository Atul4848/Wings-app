import { regex } from '@wings-shared/core';

export const fields = {
  startDate: {
    label: 'Start Date*',
    rules: 'required',
  },
  title: {
    label: 'Title*',
    rules: 'required|string|between:1,200',
  },
  category: {
    label: 'Category*',
    rules: 'required',
  },
  releaseVersion: {
    label: 'Version',
    rules: `regex:${regex.softwareVersion}`,
  },
  isInternal: {
    label: 'Is Internal',
  },
  isPublished: {
    label: 'Is Published',
  },
  isArchived: {
    label: 'Is Archived',
  },
  blobUrls: {
    label: 'Images',
  },
  message: {
    label: 'Message',
  },
};
