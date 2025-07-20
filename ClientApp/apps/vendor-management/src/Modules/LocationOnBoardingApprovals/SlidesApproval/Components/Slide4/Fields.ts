import { auditFields } from '@wings/shared';
export const fields = {
  ...auditFields,
  id: {
    label: 'Id',
  },
  addressLine1: {
    label: 'Street Address*',
    rules: 'required|string|between:1,200',
  },
  addressLine2: {
    label: 'Street Address 2',
    rules: 'string',
  },
  addressType: {
    label: 'Address Type',
  },
  countryReference: {
    label: 'Country*',
    rules: 'required',
  },
  stateReference: {
    label: 'State',
  },
  cityReference: {
    label: 'City*',
    rules: 'required',
  },
  zipCode: {
    label: 'Zip Code*',
    rules: 'required|string|between:1,10',
  },
  advanceOverTimeRequested: {
    label: 'How far in advance does overtime need to be requested ?*',
    rules: 'required|string|between:1,200',
  },
  airfieldLocation: {
    label: 'Location on airfield*',
    rules: 'required|string|between:1,200',
  },
  overTimeRequested: {
    label: 'Can overtime be requested ?*',
    rules: 'required|string|between:1,200',
  },
  arinc: {
    label: 'Air to ground frequency (ARINC)*',
    rules: 'required|string|between:1,200',
  },
}