export const fields = {
  generalInformation: {
    fields: {
      usCrewPaxInfo: {
        label: 'US PAX Aircraft Notes',
      },
      nonUSCrewPaxInfo: {
        label: 'Non US PAX Aircraft Notes',
      },
      generalInfo: {
        label: 'Notes',
      },
      flightsAllowed: {
        label: 'Types of Flights Allowed',
      },
      otherInformation: {
        label: 'Other General Information',
        rules: 'string|between:1,500',
      },
      activeDutyCrewDefinition: {
        label: 'Active Duty Crew Definition',
        rules: 'string|between:1,500',
      },
      crewSwapOnlyLegDetails: {
        label: 'Crew Swap Only Leg Details',
        rules: 'string|between:1,500',
      },
      disinsectionSprayRequirements: {
        label: 'Disinsection/Disinfection Requirements',
        rules: 'string|between:1,500',
      },
      isBusinessExemption: {
        label: 'Business Exemptions',
      },
      businessExemptions: {
        label: 'Business Exemptions Requirements',
        rules: 'string|between:1,500',
      },
      isEssentialWorkersAllowed: {
        label: 'Essential Workers Allowed',
      },
      isTechStopAllowed: {
        label: 'Tech Stops Allowed',
      },
      isFuelStopAllowed: {
        label: 'Fuel Stops Allowed',
      },
      isDisinsectionRequired: {
        label: 'Disinsection Required',
      },
      isTopOfDescentSprayRequired: {
        label: 'Top of Descent Spray Required',
      },
      isDocumentationRequired: {
        label: 'Documentation Required',
      },
      whoCanLeaveAircraft: {
        label: 'Who can leave this aircraft?',
      },
      serviceRestrictions: {
        label: 'Service Restrictions',
        rules: 'string|between:1,500',
      },
      healthAuthorizationLinks: {
        value: [],
      },
      healthAuthorizationNOTAMs: {
        value: [],
      },
      isAircraftDisinfectionRequired: {
        label: 'Aircraft Disinfection Required',
      },
      isCTSAccepted: {
        label: 'Cedars Health / UWA PCR Test Accepted',
      },
      healthAuthorizationBannedTraveledCountries: {
        label: 'Banned Traveled Countries',
      },
      isInherited: {
        label: 'Same as Parent',
      },
    },
  },
};
