import { regex } from '@wings-shared/core';
import { auditFields } from '@wings/shared';

export const fields = {
  popularNames: {
    label: 'Popular Names',
    value: [],
  },
  otherNames: {
    label: 'Other Names',
    value: [],
  },
  numberOfEngines: {
    label: 'Number of Engines*',
    rules: 'required|integer|max:99',
  },
  minimumRunwayLength: {
    label: 'Minimum Runway Length',
    rules: 'integer|max:99999',
  },
  range: {
    label: 'Range',
    rules: 'integer|max:9999',
  },
  isManufactureDataLicense: {
    label: 'Manufacture Data License',
  },
  manufactureDataLicenseStartDate: {
    label: 'manufacture Data License Start Date',
  },
  manufactureDataLicenseEndDate: {
    label: 'manufacture Data License End Date',
  },
  maxCrosswind: {
    label: 'Max Cross Wind',
    rules: 'integer|between:1,999',
  },
  maxTailWind: {
    label: 'Max Tail Wind',
    rules: 'integer|between:1,999',
  },
  isPermissionToLoadRequired: {
    label: 'Permission To Load Required',
  },
  make: {
    label: 'Make*',
    rules: 'required',
  },
  model: {
    label: 'Model*',
    rules: 'required',
  },
  performances: {
    label: 'Performances',
  },
  series: {
    label: 'Series',
  },
  engineType: {
    label: 'Engine Type*',
    rules: 'required',
  },
  icaoTypeDesignator: {
    label: 'ICAO Type Designator*',
    rules: 'required',
  },
  propulsionType: {
    label: 'Propulsion Type',
  },
  fuelType: {
    label: 'Fuel Type',
  },
  category: {
    label: 'Category',
  },
  subCategory: {
    label: 'Sub Category',
  },
  fireCategory: {
    label: 'Fire Category',
  },
  wakeTurbulenceCategory: {
    label: 'Wake Turbulence Category',
  },
  distanceUOM: {
    label: 'Distance UOM',
  },
  rangeUOM: {
    label: 'Range UOM',
  },
  windUOM: {
    label: 'Wind UOM',
  },
  wingspan: {
    label: 'Wingspan (m)',
    rules: `numeric|between:0,999.99|regex:${regex.numberWithTwoDecimal}`,
  },
  comments: {
    label: 'Comments',
    rules: 'string|between:1,500',
  },
  sourceType: {
    label: 'Source Type',
  },
  accessLevel: {
    label: 'Access Level',
  },
  status: {
    label: 'Status',
  },
  modifications: {
    label: 'Modifications',
    value: [],
  },
  stcManufactures: {
    label: 'STC Manufacture',
    value: [],
  },
  militaryDesignations: {
    label: 'Military Designations',
    value: [],
  },
  pictureUrl: {
    label: 'Picture Url',
  },
  cappsModel: {
    label: 'Capps Model',
    rules: 'string|between:1,500',
  },
  cappsEngineType: {
    label: 'Capps Engine Type',
    rules: 'string|between:1,50',
  },
  cappsCruiseSchedule: {
    label: 'Capps Cruise Schedule',
    rules: 'string|between:1,200',
  },
  cappsSeries: {
    label: 'Capps Series',
    rules: 'string|between:1,50',
  },
  cappsRecordId: {
    label: 'Capps Record Id',
  },
  isUwaFlightPlanSupported: {
    label: 'UWA Flight Plan Supported',
  },
  isVerificationComplete: {
    label: 'Verification Complete',
  },
  ...auditFields,
};
