import { regex } from '@wings-shared/core';

export const fields = {
  domesticMeasure: {
    fields: {
      isInherited: { label: 'Same as Parent', rules: 'boolean' },
      isPassengerVaccineExemption: {},
      isCrewVaccineExemption: {},
      isAgeExemption: { label: 'Age Exemption' },
      ageExemptionInfo: { label: 'Age Exemption Info', rules: 'string|between:1,200' },
      age: { label: 'Age', rules: 'integer|min:1' },
      isPPERequired: { label: 'PPE Required' },
      isAllowedTravelInCountry: { label: 'Allowed Travel within Country' },
      domesticMeasureCurfewHours: { label: 'Curfew Hours', value: [] },
      businessAvailable: { label: 'Business Available', rules: 'string|between:1,500' },
      isIdentificationRequiredOnPerson: { label: 'ID required on Person during Stay' },
      extraInformation: { label: 'Other Information', rules: 'string|between:1,500' },
      domesticMeasurePPERequired: { label: 'PPE Type', value: [] },
      domesticMeasureIdRequired: { label: 'Id Type', value: [] },
      domesticMeasureRestrictedActivitiesName: {
        label: 'Domestic Measure Restricted Activities',
        value: [],
        rules: `regex:${regex.domesticMeasureRestrictedActivities}`,
      },
      domesticTravelRequirements: { label: 'Domestic Travel Requirements', rules: 'string|between:1,400' },
      stateRegionSpecificInfo: { label: 'State/Region Specific Info', rules: 'string|between:1,400' },
    },
  },
};
