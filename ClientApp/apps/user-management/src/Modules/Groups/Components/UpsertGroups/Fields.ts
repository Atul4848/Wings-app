import { regex } from '@wings-shared/core';

export const fields = {
  name: {
    label: 'Name',
    rules: 'required|string|between:4,50',
    validators: ({ field, form }) => {
      return [
        Boolean(field.value) ? regex.lowerCaseGroupName.test(field.value) : true,
        'The Name field should contains only numbers, periods and lowercase letters.',
      ];
    },
  },
  description: {
    label: 'Description',
  },
  unlocked: {
    label: 'Unlocked',
  },
  idleTimeout: {
    label: 'IdleTimeout',
    rules: 'required|numeric|integer|min:0|max:604800',
  },
};
