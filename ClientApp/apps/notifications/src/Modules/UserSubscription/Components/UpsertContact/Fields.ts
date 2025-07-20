import { regex } from '@wings-shared/core';

export const fields = {
  deliveryType: {
    label: 'Delivery Type',
    rules: 'required',
    placeholder: 'Select Delivery Type',
  },
  name: {
    label: 'Name',
    rules: `required|string|between:1,200|regex:${regex.fullName}`,
    placeholder: 'Enter Name',
  },
  value: {
    label: 'Value',
    rules: 'required|between:0,200',
    placeholder: 'Enter Value',
  },
};
