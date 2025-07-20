import { regex } from '@wings-shared/core';
import { auditFields } from '@wings/shared';

export const fields = {
  name: {
    label: 'Name*',
    rules: 'required|string|between:1,30',
  },
  maxFlightLevel: {
    label: 'Max Flight Level',
    rules: 'size:3',
    type: 'number',
  },
  mtowInPounds: {
    label: 'MTOW In Pounds',
    rules: `numeric|between:1,9999999|regex:${regex.numberOnly}`,
  },
  mtowInKilos: {
    label: 'MTOW In Kilos',
    rules: 'numeric',
  },
  icaoTypeDesignator: {
    label: 'ICAO Type Designator*',
    rules: 'required',
  },
  wakeTurbulenceCategory: {
    label: 'Wake Turbulence Category*',
    rules: 'required',
  },
  modifiedOn: {
    label: 'Modified On',
  },
  createdOn: {
    label: 'Created On',
  },
  accessLevel: {
    label: 'Access Level*',
    rules: 'required',
  },
  sourceType: {
    label: 'Source Type',
  },
  status: {
    label: 'Status*',
    rules: 'required',
  },
  comments: {
    label: 'Comments',
    rules: 'string|between:1,2000',
  },
  fomS230: {
    label: 'FOMS230',
    rules: 'string|between:1,500',
  },
  defaultClimbSchedule: {
    label: 'defaultClimbSchedule',
  },
  defaultHoldSchedule: {
    label: 'defaultHoldSchedule',
  },
  defaultDescentSchedule: {
    label: 'defaultDescentSchedule',
  },
  defaultCruiseSchedule: {
    label: 'defaultCruiseSchedule',
  },
  performanceLinks: {
    label: 'performanceLinks',
    value: [],
  },
  climbSchedules: {
    label: 'climbSchedules',
    value: [],
  },
  holdSchedules: {
    label: 'Hold Schedules',
    value: [],
  },
  descentSchedules: {
    label: 'Descent Schedules',
    value: [],
  },
  cruiseSchedules: {
    label: 'Cruise Schedules',
    value: [],
  },
  navBlueGenericRegistries: {
    label: 'Generic Registry',
    value: [],
  },
  isRestricted: {
    label: 'Is Restricted',
  },
  isVerificationComplete: {
    label: 'Verification Complete',
  },
  ...auditFields,
};
