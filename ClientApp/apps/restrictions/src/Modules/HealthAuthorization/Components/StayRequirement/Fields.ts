import { regex } from '@wings-shared/core';

export const fields = {
  crewStayRequirement: {
    fields: {
      isInherited: {
        label: 'Same as Parent',
        rules: 'boolean',
      },
      isStayRequired: {
        label: 'Stay Requirement',
      },
      stayLength: {
        label: 'Stay Length',
        rules: 'numeric',
      },
      stayLengthCategory: {
        label: 'Stay Length Category',
      },
      isLengthOfStay: {
        label: 'Or Length Of Stay',
      },
      isVaccineExemption: {
        label: 'Vaccine Excemption',
      },
      isGovernmentHealthCheckRequired: {
        label: 'Government Health Checks',
      },
      isTestRequired: {
        label: 'Test Required',
      },
      testType: {
        label: 'Test Type',
      },
      testVendorAllowed: {
        label: 'Test Vendor Allowed',
        rules: 'string|between:1,100',
      },
      isSpecificHotelsOnly: {
        label: 'Specific Hotels Only',
      },
      isCrewDesignationChange: {
        label: 'Crew Designation Change',
      },
      crewDesignationChangeLengthOfStay: {
        label: 'Crew Designation Change Length Of Stay',
        rules: 'numeric',
      },
      extraInformation: {
        label: 'Extra Information',
        rules: 'string|between:1,500',
      },
      hotelsAllowedName: {
        label: 'Hotels Allowed',
        value: [],
        rules: `regex:${regex.stayHotelsAllowed}`,
      },
      testFrequenciesName: {
        label: 'Test Frequencies',
        value: [],
        rules: `regex:${regex.testFrequencies}`,
      },
      testFrequency: {
        label: 'Test Frequencies',
        rules: 'string|between:1,50',
      },
    },
  },
  passengerStayRequirement: {
    fields: {
      isInherited: {
        label: 'Same as Parent',
        rules: 'boolean',
      },
      isStayRequired: {
        label: 'Stay Requirement',
      },
      stayLength: {
        label: 'Stay Length',
        rules: 'numeric',
      },
      stayLengthCategory: {
        label: 'Stay Length Category',
      },
      isLengthOfStay: {
        label: 'Or Length Of Stay',
      },
      isVaccineExemption: {
        label: 'Vaccine Excemption',
      },
      isGovernmentHealthCheckRequired: {
        label: 'Government Health Checks',
      },
      isTestRequired: {
        label: 'Test Required',
      },
      testType: {
        label: 'Test Type',
      },
      testVendorAllowed: {
        label: 'Test Vendor Allowed',
        rules: 'string|between:1,100',
      },
      isSpecificHotelsOnly: {
        label: 'Specific Hotels Only',
      },
      extraInformation: {
        label: 'Extra Information',
        rules: 'string|between:1,500',
      },
      hotelsAllowedName: {
        label: 'Hotels Allowed',
        value: [],
        rules: `regex:${regex.stayHotelsAllowed}`,
      },
      testFrequenciesName: {
        label: 'Test Frequencies',
        value: [],
        rules: `regex:${regex.testFrequencies}`,
      },
      testFrequency: {
        label: 'Test Frequencies',
        rules: 'string|between:1,50',
      },
    },
  },
};
