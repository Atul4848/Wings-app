import { regex } from '@wings-shared/core';

export const fields = {
  crewExitRequirement: {
    fields: {
      isExitRequirement: {
        label: 'Exit Requirement',
      },
      isSymptomBased: {
        label: 'Symptom Based',
      },
      isFormsRequired: {
        label: 'Forms Required',
      },
      formRequirements: {
        label: 'Form Requirements',
        value: [],
      },
      isPreDepartureTestRequired: {
        label: 'Pre Departure Test Required',
      },
      isVaccineExemption: {
        label: 'Vaccine Exemption',
      },
      testType: {
        label: 'Test Type*',
      },
      testFrequenciesName: {
        label: 'Test Frequencies',
        value: [],
        rules: `regex:${regex.testFrequencies}`,
      },
      isArrivalTestVaccineExemption: {
        label: 'Arrival Test Vaccine Exemption',
        disabled: true,
      },
      isPreDepartureTestVaccineExemption: {
        label: 'Pre-Departure Test Vaccine Exemption',
      },
      isProofToBoard: {
        label: 'Proof To Board',
      },
      boardingTypes: {
        label: 'Boarding Types',
        value: [],
      },
      consequences: {
        label: 'Consequences',
        rules: 'string|between:1,500',
      },
      leadTime: {
        label: 'Lead Time',
        rules: 'numeric',
      },
      extraInformation: {
        label: 'Extra Information',
        rules: 'string|between:1,500',
      },
      isInherited: {
        label: 'Same as Parent',
        rules: 'boolean',
      },
    },
  },
  passengerExitRequirement: {
    fields: {
      isExitRequirement: {
        label: 'Exit Requirement',
      },
      isSymptomBased: {
        label: 'Symptom Based',
      },
      isFormsRequired: {
        label: 'Forms Required',
      },
      formRequirements: {
        label: 'Form Requirements',
        value: [],
      },
      isPreDepartureTestRequired: {
        label: 'Pre Departure Test Required',
      },
      isVaccineExemption: {
        label: 'Vaccine Exemption',
      },
      testType: {
        label: 'Test Type*',
      },
      testFrequenciesName: {
        label: 'Test Frequencies',
        value: [],
        rules: `regex:${regex.testFrequencies}`,
      },
      isArrivalTestVaccineExemption: {
        label: 'Arrival Test Vaccine Exemption',
        disabled: true,
      },
      isPreDepartureTestVaccineExemption: {
        label: 'Pre-Departure Test Vaccine Exemption',
      },
      isProofToBoard: {
        label: 'Proof To Board',
      },
      boardingTypes: {
        label: 'Boarding Types',
        value: [],
      },
      consequences: {
        label: 'Consequences',
        rules: 'string|between:1,500',
      },
      leadTime: {
        label: 'Lead Time',
        rules: 'numeric',
      },
      extraInformation: {
        label: 'Extra Information',
        rules: 'string|between:1,500',
      },
      isInherited: {
        label: 'Same as Parent',
        rules: 'boolean',
      },
    },
  },
};
