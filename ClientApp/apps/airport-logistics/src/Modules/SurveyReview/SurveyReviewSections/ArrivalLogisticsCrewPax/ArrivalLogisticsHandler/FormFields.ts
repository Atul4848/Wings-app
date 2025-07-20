export const fields = [
  'arrivalExpectedProcedures',
  'rampSideShuttleAvailable',
  'walkDistance',
  'disabilitiesAccomomodationAvailability',
  'arrivalCrewPassengerPassportHandling',
  'arrivalLuggageHandling',
  'arrivalMeetingPoint',
  'arrivalAddress',
  'additionalInstructionsForGate',
];

export const placeholders = {
  'arrivalExpectedProcedures': '',
  'rampSideShuttleAvailable': '',
  'walkDistance': '',
  'disabilitiesAccomomodationAvailability': '',
  'arrivalCrewPassengerPassportHandling': '',
  'arrivalLuggageHandling': '',
  'arrivalMeetingPoint': '',
  'arrivalAddress': '',
  'additionalInstructionsForGate': '',
}

export const labels = {
  'arrivalExpectedProcedures': '',
  'rampSideShuttleAvailable': '',
  'walkDistance': '',
  'disabilitiesAccomomodationAvailability': '',
  'arrivalCrewPassengerPassportHandling': '',
  'arrivalLuggageHandling': '',
  'arrivalMeetingPoint': '',
  'arrivalAddress': '',
  'additionalInstructionsForGate': '',
}

export const rules = {
  'rampSideShuttleAvailable': 'required|string',
  'walkDistance': 'required|string',
  'arrivalAddress': 'required|string',
  'additionalInstructionsForGate': 'required|string',
}

export const options = {
  'walkDistance': [
    'Less than 5 min walk (300m approx.)',
    'About 5-10 min walk (500m approx.)',
    'About 10-15 min walk (1000m approx.)',
    'More than 15 min walk (more than 1000m)',
  ],
  'rampSideShuttleAvailable': [ 'Yes', 'No' ],
}
