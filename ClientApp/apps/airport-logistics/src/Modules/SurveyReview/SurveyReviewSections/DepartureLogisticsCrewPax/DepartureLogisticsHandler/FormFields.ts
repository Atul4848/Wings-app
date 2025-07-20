export const fields = [
  'departureProcedures',
  'otherExpectedProcedures',
  'meetingLocation',
  'meetingLocationFilePath',
  'departureAddress',
];

export const placeholders = {
  'otherExpectedProcedures': 'Other Expected Procedure',
  'meetingLocation': 'Meeting Location',
  'meetingLocationFilePath': 'Meeting Location File Path',
  'departureAddress': 'Departure Address',
}

export const labels = {
  'departureAddress': 'Departure Address',
}

export const rules = {
  'otherExpectedProcedures': 'required|string',
  'meetingLocation': 'required|string',
  'meetingLocationFilePath': 'required|string',
  'departureAddress': 'required|string',
}
