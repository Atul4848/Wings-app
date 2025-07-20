import { regex } from '@wings-shared/core';
import { auditFields } from '@wings/shared';

export const fields = {
  country: {
    label: 'Country*',
    rules: 'required',
  },
  permitType: {
    label: 'Permit Type*',
    rules: 'required',
  },
  isRequired: {
    label: 'Is Required',
  },
  isException: {
    label: 'Is Exception',
  },
  exception: {
    label: 'Exception',
    rules: 'between:1,2000',
    disabled: true,
  },
  accessLevel: {
    label: 'Access Level*',
    rules: 'required',
  },
  sourceType: {
    label: 'Source Type*',
    rules: 'required',
  },
  status: {
    label: 'Status*',
    rules: 'required',
  },
  permitApplied: {
    fields: {
      permitAppliedTo: {
        label: 'Permit Applied To',
      },
      extendedByNM: {
        label: 'Extended by Nautical Miles',
        rules: `regex:${regex.onePlaceDecimal}`,
      },
      isADIZ: {
        label: 'Is ADIZ',
      },
    },
  },
  ...auditFields,
};
