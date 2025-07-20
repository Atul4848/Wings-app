import { auditFields } from '@wings/shared';

export const fields = {
  airport: {
    label: 'Airport Code*',
    rules: 'required',
  },
  timezoneRegion: {
    label: 'Time Zone Region*',
    rules: 'required',
  },
  latitudeDegrees: {
    label: 'Latitude Degrees',
  },
  longitudeDegrees: {
    label: 'Longitude Degrees',
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
  ...auditFields,
};
