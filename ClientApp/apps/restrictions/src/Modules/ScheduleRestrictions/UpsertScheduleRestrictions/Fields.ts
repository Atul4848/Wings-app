import { regex } from '@wings-shared/core';
import { auditFields } from '@wings/shared';

export const fields = {
  ...auditFields,
  restrictionType: {
    label: 'Restriction Type*',
    rules: 'required',
    placeholder: 'Search Restriction Type',
  },
  restrictingEntities: {
    label: 'Restricting Entities',
    placeholder: 'Search Restricting Entity',
    value: [],
  },
  departureLevel: {
    label: 'Departure Level',
    placeholder: 'Search Departure Level',
  },
  isAllDeparture: { label: 'ALL' },
  departureLevelEntities: {
    label: 'Departure Entities',
    placeholder: 'Search Departure Entity',
    relatedField: 'departureLevel',
    value: [],
  },
  departureEntityExceptions: {
    label: 'Departure Entity Exceptions',
    placeholder: 'Search Departure Entity Exceptions',
    relatedField: 'departureLevel',
    value: [],
  },
  arrivalLevel: {
    label: 'Arrival Level',
    placeholder: 'Search Arrival Level',
  },
  isAllArrival: { label: 'ALL' },
  arrivalLevelEntities: {
    label: 'Arrival Entities',
    placeholder: 'Search Arrival Entity',
    relatedField: 'arrivalLevel',
    value: [],
  },
  arrivalEntityExceptions: {
    label: 'Arrival Entity Exceptions',
    placeholder: 'Search Arrival Entity Exceptions',
    relatedField: 'arrivalLevel',
    value: [],
  },
  overFlightLevel: {
    label: 'Overflight Level',
    placeholder: 'Search Overflight Level',
  },
  isAllOverFlight: { label: 'ALL' },
  overFlightLevelEntities: {
    label: 'Overflight Entities',
    placeholder: 'Search Overflight Entity',
    relatedField: 'overFlightLevel',
    value: [],
  },
  overFlightEntityExceptions: {
    label: 'Overflight Entity Exceptions',
    placeholder: 'Search Overflight Entity Exceptions',
    relatedField: 'overFlightLevel',
    value: [],
  },
  farTypes: {
    label: 'Far Types',
    placeholder: 'Search Far Type',
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
  validatedDate: {
    label: 'Validated Date',
    placeholder: 'Select Validated Date',
  },
  validatedBy: {
    label: 'Validated By',
    rules: `regex:${regex.alphabetsWithSpaces}`,
    placeholder: 'Validated By',
  },
  validationNotes: {
    label: 'Validation Notes',
    rules: 'string|between:1,500',
    placeholder: 'Validation Notes',
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
