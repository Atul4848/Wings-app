export const generalFields = {
  customsAvailableAtAirport: {
    label: 'Customs Available at Airport',
  },
  customOfficerDispacthedFromAirport: {
    label: 'Customs Officer Dispatched From Airport',
  },
  appliedCustomsLocationInformations: {
    label: 'Customs Location Information',
  },
  customsClearanceFBOs: {
    label: 'Clearance FBOs',
    value: [],
  },
  clearanceLocationSpecifics: {
    label: 'Clearance Location Specifics',
    rules: 'string|max:200',
  },
  gaClearanceAvailable: {
    label: 'GA Clearance Available',
  },
  maximumPersonsOnBoardAllowedForGAClearance: {
    label: 'Maximum Persons on Board Allowed for GA Clearance',
    rules: 'numeric|min:1|max:999',
  },
  appliedMaxPOBAltClearanceOptions: {
    label: 'Max POB Alternate Clearance Options',
  },
  maxPOBNotes: {
    label: 'Max POB Notes',
    rules: 'string|max:1000',
  },
};
