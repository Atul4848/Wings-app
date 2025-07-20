import { regex } from '@wings-shared/core';

export const fields = {
  uwaCustomerId: {
    label: 'UWA Customer No*',
    rules: `required|regex:${regex.numeric}`,
  },
  wfsCustomerId: {
    label: 'WFC No*',
    rules: `required|regex:${regex.numeric}`,
  },
  customerName: {
    label: 'Customer Name*',
    rules: `required|regex:${regex.alphabetsWithSpacesAndDot}`,
  },
};
  