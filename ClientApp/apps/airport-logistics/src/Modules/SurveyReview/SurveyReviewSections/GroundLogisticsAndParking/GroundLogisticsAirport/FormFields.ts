import { regex } from '@wings-shared/core';

export const fields = [
  'parkingDiffMonths',
  'typesOfAircraftOperating',
  'overnightParkingIssue',
  'nearbyParkingAirports',
  'parkingDurationPair',
  'parkingDurationPair.value',
  'parkingDurationPair.unit',
  'aircraftRestrictions', // checkboses
  'mtowPair',
  'mtowPair.value',
  'mtowPair.unit',
];

export const placeholders = {
  'parkingDiffMonths': '',
  'typesOfAircraftOperating': '',
  'overnightParkingIssue': '',
  'nearbyParkingAirports': 'ICAO(s) separated by commas',
  'parkingDurationPair.value': 'Number of Hours, Days or Weeks',
  'parkingDurationPair.unit': 'Select Unit',
  'mtowPair.value': 'Number of LBS, KGS, TONS (US) or TONS (Metric)',
  'mtowPair.unit': 'Select Unit',
}

export const labels = {
  'parkingDiffMonths': '',
  'typesOfAircraftOperating': '',
  'overnightParkingIssue': '',
  'nearbyParkingAirports': 'ICAO(s) separated by commas',
  'parkingDurationPair.value': 'Number of Hours, Days or Weeks',
  'parkingDurationPair.unit': 'Select Unit',
  'mtowPair.value': 'Number of LBS, KGS, TONS (US) or TONS (Metric)',
  'mtowPair.unit': 'Select Unit',
}

export const rules = {
  'overnightParkingIssue': 'required|string',
  'nearbyParkingAirports': [ 'required', 'string', `regex:${regex.icaoList}` ],
  'parkingDurationPair.value': 'required|numeric|min:1|max:999999',
  'parkingDurationPair.unit': 'required|string',
  'mtowPair.value': 'required|numeric|min:1|max:300000',
  'mtowPair.unit': 'required|string',
}

export const options = {
  'overnightParkingIssue': [
    'No, we rarely experience parking shortages',
    'We sometimes have parking shortages',
    'Yes, we frequently have parking shortages or have a maximum stay allowed',
  ],
  'parkingDurationPair.unit': [ 'Hour(s)', 'Day(s)', 'Week(s)' ],
  'mtowPair.unit': [ 'lbs', 'kgs', 'tons (US)', 'tons (Metric)' ],
}
