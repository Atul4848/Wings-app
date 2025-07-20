import { IAPIGridRequest, regex, Utilities } from '@wings-shared/core';
import { auditFields } from '@wings/shared';
export const fields = {
  ...auditFields,
  name: {
    label: 'Hotel Name*',
    rules: 'required|string|between:1,200',
  },
  externalId: {
    label: 'External ID*',
    rules: 'required|string',
  },
  hotelSource: {
    label: 'External Source',
    rules: 'string|between:1,50',
  },
  addressLine1: {
    label: 'Address Line 1',
    rules: 'string|between:1,200',
  },
  addressLine2: {
    label: 'Address Line 2',
    rules: 'string|between:1,200',
  },
  city: {
    label: 'City',
  },
  zipCode: {
    label: 'Zip',
    rules: 'string',
  },
  state: {
    label: 'State',
  },
  country: {
    label: 'Country*',
    rules: 'required',
  },
  localPhoneNumber: {
    label: 'Local Phone Number',
    rules: 'string',
  },
  faxNumber: {
    label: 'Fax Number',
    rules: 'string',
  },
  reservationEmail: {
    label: 'Reservation Email',
    rules: 'string|email',
  },
  frontDeskEmail: {
    label: 'Front Desk Email',
    rules: 'string|email',
  },
  website: {
    label: 'Website',
    rules: `string|between:1,2048|regex:${regex.urlV2}`,
  },
  airports: {
    value: [],
  },
  distance: {
    label: 'Distance from Airport',
    rules: `numeric|between:0.0,999.9|regex:${regex.numberWithTwoDecimal}`,
  },
  longitude: {
    label: 'Longitude',
    validators: ({ field, form }) => {
      return [ Boolean(field.value) ? regex.longitude.test(field.value) : true, 'The Longitude format is invalid.' ];
    },
  },
  latitude: {
    label: 'Latitude',
    validators: ({ field, form }) => {
      return [ Boolean(field.value) ? regex.latitude.test(field.value) : true, 'The Latitude format is invalid.' ];
    },
  },
  accessLevel: {
    label: 'Access Level*',
    rules: 'required',
  },
  status: {
    label: 'Status*',
    rules: 'required',
  },
  sourceType: {
    label: 'Source Type',
  },
};

export const airportRequest = (searchValue): IAPIGridRequest => {
  return {
    searchCollection: JSON.stringify([
      Utilities.getFilter('DisplayCode', searchValue),
      Utilities.getFilter('Name', searchValue, 'or'),
    ]),
    specifiedFields: [ 'AirportId', 'DisplayCode', 'Name', 'Status' ],
    filterCollection: JSON.stringify([ Utilities.getFilter('Status.Name', 'Active') ]),
  };
};

export const latitudeDMS = (lat, long): string => {
  const { latitude } = Utilities.getLatLongDMSCoords(long, lat);
  return Utilities.dmsCoords(latitude);
};

export const longitudeDMS = (lat, long): string => {
  const { longitude } = Utilities.getLatLongDMSCoords(long, lat);
  return Utilities.dmsCoords(longitude);
};
