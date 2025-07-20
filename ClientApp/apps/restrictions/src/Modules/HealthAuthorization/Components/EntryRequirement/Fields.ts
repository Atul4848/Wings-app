export const fields = {
  crewEntryRequirement: {
    fields: {
      isInherited: {
        label: 'Same as Parent',
        rules: 'boolean',
      },
      isEntryRequirements: {
        label: 'Entry Requirements',
      },
      isPreApprovalRequired: {
        label: 'Pre-Approval Required',
      },
      preApprovalEntryRequirement: {
        fields: {
          leadTime: {
            label: 'Lead Time',
            rules: 'numeric',
          },
          landingPermitImplications: {
            label: 'Landing Permit Implications',
            rules: 'string|between:1,50',
          },
        },
      },
      isPreTravelTestRequired: {
        label: 'Pre-Travel Test Required',
      },
      preTravelTestEntryRequirement: {
        fields: {
          isPreTravelTestVaccineExemption: {
            label: 'Vaccine Exemption',
          },
          testType: {
            label: 'Type of Test*',
          },
          isProofRequiredBeforeBoarding: {
            label: 'Proof Required to Board',
          },
          leadTime: {
            label: 'Lead Time',
            rules: 'numeric',
          },
          leadTimeIndicator: {
            label: 'Before Departure or Arrival',
          },
          consequences: {
            label: 'Consequences',
            rules: 'string|between:1,200',
          },
          preTravelTestDetails: {
            label: 'Pre Travel Test Details',
            value: [],
          },
        },
      },
      isTestRequiredOnArrival: {
        label: 'Test Required on Arrival',
      },
      arrivalTestEntryRequirement: {
        fields: {
          isArrivalTestVaccineExemption: {
            label: 'Vaccine Exemption',
          },
        },
      },
      isHealthScreeningOnArrival: {
        label: 'Health Screening on Arrival',
      },
      isRandomScreeningTestingPossible: {
        label: 'Random Screening/ Testing possible',
      },
      isFormsRequired: {
        label: 'Forms Required',
      },
      formRequirements: {
        label: 'Form Requirements',
        value: [],
      },
      isStayContactInfoRequired: {
        label: 'Stay Contact Info Required',
      },
      isHotelPreBookingRequired: {
        label: 'Hotel Pre-Booking Required',
      },
      isSymptomaticUponArrivalRequirements: {
        label: 'Symptomatic upon Arrival Requirements',
      },
      symptomaticUponArrivalRequirements: {
        label: 'Symptomatic upon Arrival Requirements',
        rules: 'string|between:1,500',
      },
      isHealthInsuranceRequired: {
        label: 'Health Insurance Required',
      },
      typeOfHealthInsuranceRequired: {
        label: 'Health Insurance Requirements',
        rules: 'string|between:1,200',
      },
      extraInformation: {
        label: 'Extra Information',
        rules: 'string|between:1,600',
      },
      ageExemption: {
        label: 'Age Exemption',
        rules: 'integer|min:1',
      },
      covidRecoveredPassengerExemption: {
        label: 'Exemption For COVID Recovered Crew',
        rules: 'string|between:0,600',
      },
      entryRequirementBannedNationalitiesRegions: {
        label: 'Banned Nationality Regions',
      },
      entryRequirementBannedNationalities: {
        label: 'Banned Nationalities',
      },
    },
  },
  passengerEntryRequirement: {
    fields: {
      isInherited: {
        label: 'Same as Parent',
        rules: 'boolean',
      },
      isEntryRequirements: {
        label: 'Entry Requirements',
      },
      isPreApprovalRequired: {
        label: 'Pre-Approval Required',
      },
      preApprovalEntryRequirement: {
        fields: {
          leadTime: {
            label: 'Lead Time',
            rules: 'numeric',
          },
          landingPermitImplications: {
            label: 'Landing Permit Implications',
            rules: 'string|between:1,50',
          },
        },
      },
      isPreTravelTestRequired: {
        label: 'Pre-Travel Test Required',
      },
      preTravelTestEntryRequirement: {
        fields: {
          isPreTravelTestVaccineExemption: {
            label: 'Vaccine Exemption',
          },
          testType: {
            label: 'Type of Test*',
          },
          isProofRequiredBeforeBoarding: {
            label: 'Proof Required to Board',
          },
          leadTime: {
            label: 'Lead Time',
            rules: 'numeric',
          },
          leadTimeIndicator: {
            label: 'Before Departure or Arrival',
          },
          consequences: {
            label: 'Consequences',
            rules: 'string|between:1,200',
          },
          preTravelTestDetails: {
            label: 'Pre Travel Test Details',
            value: [],
          },
        },
      },
      isTestRequiredOnArrival: {
        label: 'Test Required on Arrival',
      },
      arrivalTestEntryRequirement: {
        fields: {
          isArrivalTestVaccineExemption: {
            label: 'Vaccine Exemption',
          },
        },
      },
      isHealthScreeningOnArrival: {
        label: 'Health Screening on Arrival',
      },
      isRandomScreeningTestingPossible: {
        label: 'Random Screening/ Testing possible',
      },
      isFormsRequired: {
        label: 'Forms Required',
      },
      formRequirements: {
        label: 'Form Requirements',
        value: [],
      },     
      isStayContactInfoRequired: {
        label: 'Stay Contact Info Required',
      },
      isHotelPreBookingRequired: {
        label: 'Hotel Pre-Booking Required',
      },
      isSymptomaticUponArrivalRequirements: {
        label: 'Symptomatic upon Arrival Requirements',
      },
      symptomaticUponArrivalRequirements: {
        label: 'Symptomatic upon Arrival Requirements',
        rules: 'string|between:1,500',
      },
      isHealthInsuranceRequired: {
        label: 'Health Insurance Required',
      },
      typeOfHealthInsuranceRequired: {
        label: 'Health Insurance Requirements',
        rules: 'string|between:1,200',
      },
      extraInformation: {
        label: 'Extra Information',
        rules: 'string|between:1,600',
      },
      ageExemption: {
        label: 'Age Exemption',
        rules: 'integer|min:1',
      },
      covidRecoveredPassengerExemption: {
        label: 'Exemption For COVID Recovered Passenger',
        rules: 'string|between:0,600',
      },
      entryRequirementBannedNationalitiesRegions: {
        label: 'Banned Nationality Regions',
      },
      entryRequirementBannedNationalities: {
        label: 'Banned Nationalities',
      },
    },
  },
};
