export const fields = [
  'crewEarlyArrivalPair.value',
  'crewEarlyArrivalPair.unit',
  'paxEarlyArrivalPair.value',
  'paxEarlyArrivalPair.unit',
];

export const placeholders = {
  'crewEarlyArrivalPair.value': 'Crew Early Arrival',
  'crewEarlyArrivalPair.unit': 'Select Unit',
  'crewEarlyArrivalMins': 'Crew Early Arrival Minutes',
  'paxEarlyArrivalPair.value': 'Passenger Early Arrival',
  'paxEarlyArrivalMins': 'Passenger Early Arrival Minutes',
}

export const labels = {
  'crewEarlyArrivalPair.value': 'Crew Early Arrival in Numbers',
  'crewEarlyArrivalPair.unit': 'Select Unit',
  'paxEarlyArrivalPair.value': 'Passenger Early Arrival in Numbers',
  'paxEarlyArrivalPair.unit': 'Select Unit',
}

export const rules = {
  'crewEarlyArrivalPair.value': 'required|string',
  'crewEarlyArrivalPair.unit': 'required|string',
  'paxEarlyArrivalPair.value': 'required|string',
  'paxEarlyArrivalPair.unit': 'required|string',
}

export const options = {
  'crewEarlyArrivalPair.unit': [ 'minutes', 'hour(s)' ],
  'paxEarlyArrivalPair.unit': [ 'minutes', 'hour(s)' ],
}
