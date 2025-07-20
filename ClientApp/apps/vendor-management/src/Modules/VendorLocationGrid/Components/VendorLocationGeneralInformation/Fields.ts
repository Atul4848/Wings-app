import { regex } from '@wings-shared/core';
import { auditFields } from '@wings/shared';
import { VALIDATION_REGEX } from '../../../Shared/Enums/Spacing.enum';


export const fields = {
  ...auditFields,
  id: {
    label: 'Vendor Location Id',
  },
  vendor: {
    label: 'Vendor Id*',
    rules: 'required',
  },
  name: {
    label: 'Vendor Location Name*',
    rules: 'required|string|between:1,200',
  },
  radio: {
    label: 'Select',
  },
  code: {
    label: 'Vendor Location Code',
    rules: `string|between:2,3|regex:${regex.alphaNumericWithoutSpaces}`,
  },
  airportReference: {
    label: 'Airport',
  },
  hqAddressCountry:{
    label: 'Country',
  },
  hqAddressState:{
    label: 'State',
  },
  hqAddressCity:{
    label: 'City',
  },
  vendorLocationStatus: {
    label: 'Vendor Location Status*',
    rules: 'required',
  },
  automationNoteForStatusDetails:{
    label: 'Automation note for vendor location status',
    rules: 'string|between:1,200',
  },
  locationLegalName: {
    label: 'Location Legal Name',
    rules: 'string|between:1,200',
  },
  rankAtAirport: {
    label: 'Rank at Airport*',
  },
  locationStatusDetails: {
    label: 'Location status Details',
    rules: 'string|between:1,200',
  },
  cappsLocationCode:{
    label: 'CAPPS Location Code',
    rules: 'string|between:2,3',
  },
  countryDataManagement: {
    label: 'Country Data Management',
  },
  permitDataManagement: {
    label: 'Permit Data Management',
  },
  airportDataManagement: {
    label: 'Airport Data Management',
  },
};
