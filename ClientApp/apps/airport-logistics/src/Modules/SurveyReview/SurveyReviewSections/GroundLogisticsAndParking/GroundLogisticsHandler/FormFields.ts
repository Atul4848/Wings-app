export const fields = [
  'aircraftLogisFile', // string
  'aircraftParkingLocation', //checkboxes
  'aircraftTowbarRequirements', // checkboxes
  'aircraftSpotAccommodation', // checkboxes
  'airportEquipments', // checkboxes
  'towbarRequired', // radio
  'towbarRequirementScenarios',
];

export const placeholders = {
  'aircraftLogisFile': 'Aircraft Logistics File Path',
}

export const labels = {
  'aircraftLogisFile': 'Aircraft Logistics File Path',
}

export const rules = {
  'aircraftLogisFile': 'string',
}

export const options = {
  'towbarRequired': [ 'Yes', 'No', 'Sometimes' ],
}
