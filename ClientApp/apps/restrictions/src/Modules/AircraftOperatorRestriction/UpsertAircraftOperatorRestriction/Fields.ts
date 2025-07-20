import { auditFields } from '@wings/shared';

export const fields = {
  ...auditFields,
  effectedEntityType: {
    label: 'Effected Entity Type*',
    rules: 'required',
    placeholder: 'Select Effected Entity Type',
  },
  effectedEntity: {
    label: 'Effected Entity*',
    rules: 'required',
    placeholder: 'Search Effected Entity Type',
  },
  nationalities: {
    label: 'Nationalities*',
    rules: 'required',
    placeholder: 'Search Country',
    value: [],
  },
  restrictionType: {
    label: 'Restriction Type*',
    rules: 'required',
    placeholder: 'Search Restriction Type',
  },
  restrictionAppliedToLicenseHolder: {
    label: 'Restriction Applied To License Holder*',
  },
  restrictionAppliedToRegistries: {
    label: 'Restriction Applied To Registries*',
  },
  restrictionAppliedToAllFlights: {
    label: 'Restriction Applied To All Flights*',
  },
  restrictionAppliedToOperators: {
    label: 'Restriction Applied To Operators*',
  },
  restrictionAppliedToPassportedPassenger: {
    label: 'Restriction Applied To Passported Passenger*',
  },
  sfc: {
    label: 'SFC',
  },
  lowerLimitFL: {
    label: 'Lower Limit FL',
    rules: 'threeDigitsLimitValidator',
    placeholder: 'Lower Limit FL',
  },
  unl: {
    label: 'UNL',
  },
  upperLimitFL: {
    label: 'Upper Limit FL',
    rules: 'threeDigitsLimitValidator',
    placeholder: 'Upper Limit FL',
  },
  exceptForeignOperators: {
    label: 'Except Foreign Operators',
  },
  restrictionSource: {
    label: 'Restriction Source',
    placeholder: 'Restriction Source',
  },
  restrictingCountry: {
    label: 'Restricting Country',
    placeholder: 'Restriction Country',
  },
  restrictionSeverity: {
    label: 'Restriction Severity*',
    rules: 'required',
    placeholder: 'Restriction Severity',
  },
  approvalTypeRequired: {
    label: 'Approval Type Required*',
    rules: 'required',
    placeholder: 'Approval Type Required',
  },
  aircraftOperatorRestrictionForms: {
    label: 'Restriction Forms',
    placeholder: 'Restriction Forms',
    value: [],
  },
  startDate: {
    label: 'Start Date',
    placeholder: 'Select Start Date',
  },
  endDate: {
    label: 'End Date',
    placeholder: 'Select End Date',
  },
  uwaAllowableActions: {
    label: 'UWA Allowable Actions',
    placeholder: 'UWA Allowable Actions',
  },
  uwaAllowableServices: {
    label: 'Allowed Services',
    placeholder: 'Allowed Services',
    value: [],
  },
  enforcementAgency: {
    label: 'Enforcement Agency',
    placeholder: 'Enforcement Agency',
  },
  notamId: {
    label: 'Notam Id',
    rules: 'string|max:20',
    placeholder: 'Notam Id',
  },
  notamExpiryDate: {
    label: 'Notam Expiry Date',
    placeholder: 'Select Notam Expiry Date',
  },
  link: {
    label: 'Link',
    rules: 'string|max:2048',
    placeholder: 'Link',
  },
  summary: {
    label: 'Summary',
    rules: 'string',
    placeholder: 'Summary',
  },
  accessLevel: {
    label: 'Access Level*',
    rules: 'required',
    placeholder: 'Select Access Level',
  },
  status: {
    label: 'Status*',
    rules: 'required',
    placeholder: 'Select Status',
  },
  sourceType: {
    label: 'Source Type',
    placeholder: 'Select Source Type',
  },
};
