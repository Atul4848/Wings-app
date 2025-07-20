import { regex } from '@wings-shared/core';

const fields = {
  min: {
    label: 'Min',
    rules: 'required|string|max:2',
    validators: ({ field }) => {
      return [
        Boolean(field.value) ? regex.latLongMinute.test(field.value) : true,
        'Invalid Min format.',
      ];
    },
  },
  sec: {
    label: 'Sec',
    rules: 'required|string|max:7',
    validators: ({ field }) => {
      return [
        Boolean(field.value) ? regex.latLongSecond.test(field.value) : true,
        'Invalid Sec format.',
      ];
    },
  },
  dir: {
    label: 'Dir',
    rules: 'required',
  },
};

export const latFields = {
  lat: {
    label: 'LAT: Deg',
    rules: 'required|string|max:3',
    validators: ({ field }) => {
      return [
        Boolean(field.value) ? regex.latitude.test(field.value) : true,
        'Invalid Latitude format.',
      ];
    },
  },
  ...fields,
};

export const longFields = {
  long: {
    label: 'LON: Deg',
    rules: 'required|string|max:4',
    validators: ({ field }) => {
      return [
        Boolean(field.value) ? regex.longitude.test(field.value) : true,
        'Invalid Longitude format.',
      ];
    },
  },
  ...fields,
};
