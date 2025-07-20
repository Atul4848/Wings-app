import { DATE_FORMAT } from '@wings-shared/core';
import moment from 'moment';

export const conversionInputFields = {
  airport: {
    placeholder: 'Search here',
    rules: 'required',
  },
  conversionDate: {
    placeholder: 'DD-MMM-YYYY',
    rules: 'required',
    value: moment().format(DATE_FORMAT.API_FORMAT),
  },
  localTime: {
    placeholder: 'Local Time',
  },
  zuluTime: {
    placeholder: 'Zulu Time',
  },
};
