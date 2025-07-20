export const fields = {
  passengerQuarantineRequirement: {
    fields: {
      isQuarantineRequired: {
        label: 'Quarantine Requirements',
      },
      isSymptomsBased: {
        label: 'Symptom Based',
      },
      isTravelHistoryBased: {
        label: 'Based on Travel History',
      },
      previousTimeFrame: {
        label: 'Previous Time Frame',
        rules: 'integer|min:1',
      },
      periodOfQuarantineRequired: {
        label: 'Period of Quarantine Required',
        rules: 'numeric',
      },
      isGovtSelfMonitoringRequired: {
        label: 'Government Self Monitoring Required',
      },
      monitoringMethod: {
        label: 'Monitoring Method',
        rules: 'string|between:1,50',
      },
      isPeriodOfQuarantineRequired: {
        label: 'Period of Quarantine Required',
      },
      isTestExemption: {
        label: 'Test Exemption',
      },
      isLocationAllowed: {
        label: 'Where Allowed to Quarantine',
      },
      testInformation: {
        label: 'Test Information',
        rules: 'string|between:1,500',
      },
      isVaccineExemption: {
        label: 'Vaccine Exemption',
      },
      extraInformation: {
        label: 'Other Information',
        rules: 'string|between:1,500',
      },
      isAgeExemption: {
        label: 'Max Exemption Age',
      },
      age: {
        label: 'Age',
        rules: 'integer|min:1',
      },
      paxCrew: {
        label: 'Access Level*',
      },
      quarantineLocations: {
        label: 'Locations',
      },
      quarantineTraveledCountries: {
        label: 'Traveled Countries',
      },
      testModifications: {
        label: 'Test Modifications',
        rules: 'string|between:1,500',
      },
      isLengthOfStay: {
        label: 'or Length of Stay',
      },
      isInherited: {
        label: 'Same as Parent',
        rules: 'boolean',
      },
    },
  },
  crewQuarantineRequirement: {
    fields: {
      isQuarantineRequired: {
        label: 'Quarantine Requirements',
      },
      isSymptomsBased: {
        label: 'Symptom Based',
      },
      isTravelHistoryBased: {
        label: 'Based on Travel History',
      },
      previousTimeFrame: {
        label: 'Previous Time Frame',
        rules: 'integer|min:1',
      },
      periodOfQuarantineRequired: {
        label: 'Period of Quarantine Required',
        rules: 'numeric',
      },
      isGovtSelfMonitoringRequired: {
        label: 'Government Self Monitoring Required',
      },
      monitoringMethod: {
        label: 'Monitoring Method',
        rules: 'string|between:1,50',
      },
      isPeriodOfQuarantineRequired: {
        label: 'Period of Quarantine Required',
      },
      isTestExemption: {
        label: 'Test Exemption',
      },
      isLocationAllowed: {
        label: 'Where Allowed to Quarantine',
      },
      testInformation: {
        label: 'Test Information',
        rules: 'string|between:1,500',
      },
      isVaccineExemption: {
        label: 'Vaccine Exemption',
      },
      extraInformation: {
        label: 'Other Information',
        rules: 'string|between:1,500',
      },
      paxCrew: {
        label: 'Access Level*',
      },
      quarantineLocations: {
        label: 'Locations',
      },
      quarantineTraveledCountries: {
        label: 'Traveled Countries',
      },
      testModifications: {
        label: 'Test Modifications',
        rules: 'string|between:1,500',
      },
      isLengthOfStay: {
        label: 'or Length of Stay',
      },
      isInherited: {
        label: 'Same as Parent',
        rules: 'boolean',
      },
    },
  },
};
