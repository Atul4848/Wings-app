import { regex } from '@wings-shared/core';
import { auditFields } from '@wings/shared';

export const fields = {
  ...auditFields,
  id: {
    label: 'Vendor Location Id',
  },
  customsClearanceFBO: {
    label: 'Customs Clearance at FBO',
  },
  crewLatitudeLongitude: {
    label: 'Driver Pick Up Location Lat/Lon - CREW',
  },
  paxLatitudeLongitude: {
    label: 'Driver Pick Up Location Lat/Lon - PAX',
  },
  appliedCrewLocationType: {
    label: 'Driver Pick Up Location Type - CREW',
  },
  appliedPaxLocationType: {
    label: 'Driver Pick Up Location Type - PAX',
  },
  aircraftParkingOptionLatitudeLongitude: {
    label: 'Aircraft Parking Options Map',
  },
  aircraftHandlingLocationLatitudeLongitude: {
    label: 'Aircraft Handling Location',
  },
  agentFeesApply: {
    label: 'Agent Fees Apply',
  },
  appliedAmenities: {
    label: 'Amenities',
  },
  aircraftParkingField: {
    label: 'Aircraft Parking on Field',
    rules: 'string|between:0,300',
  },
  appliedAircraftParkingOptions: {
    label: 'Aircraft Parking Options',
  },
  aircraftParkingDistanceFBO: {
    label: 'Aircraft Parking Distance from FBO',
  },
  appliedAircraftSpotAccommodation: {
    label: 'Aircraft Spot Accommodation',
  },
  hangarAvailable: {
    label: 'Hangar Available',
  },
  hangarAvailableSpace: {
    label: 'Hangar Available Space',
    rules: `numeric|between:0,999999|regex:${regex.numberOnly}`,
  },
  hangerAvailableUom: {
    label: 'Hanger Available UOM',
  },
  towbarRequired: {
    label: 'Towbar Required',
  },
  appliedTowbarScenarios: {
    label: 'Towbar Scenarios',
  },
  towbarRequirement: {
    label: 'Towbar Requirements',
    rules: 'string|between:0,200',
  },
  appliedAvailableFacilities: {
    label: 'Available Facilities',
  },
  appliedInternationalArrivalProcedures: {
    label: 'International Arrival Procedures',
  },
  domesticArrivalProcedures: {
    label: 'Domestic Arrival Procedures',
    rules: 'string|between:0,1000',
  },
  appliedInternationalDepartureProcedures: {
    label: 'International Departure Procedures',
  },
  domesticDepartureProcedures: {
    label: 'Domestic Departure Procedures',
    rules: 'string|between:0,1000',
  },
  appliedDisabilityAccommodation: {
    label: 'Disability Accommodation Availability',
  },
  arrivalCrewPaxPassportHandling: {
    label: 'Arrival Crew/Pax Passport Handling',
  },
  luggageHandling: {
    label: 'Arrival Luggage Handling',
  },
  arrivalMeetingPoint: {
    label: 'Arrival Meeting Point',
    rules: 'string|between:0,300',
  },
  earlyCrewArrival: {
    label: 'Early Crew Arrival',
    rules: `numeric|between:0,999|regex:${regex.numberOnly}`,
  },
  earlyPaxArrival: {
    label: 'Early Pax Arrival',
    rules: `numeric|between:0,999|regex:${regex.numberOnly}`,
  },
  customsClearanceTiming: {
    label: 'Customs Clearance Timing (minutes)',
    rules: `numeric|between:0,999|regex:${regex.numberOnly}`,
  },
  driverDropOffLocationLatitudeLongitudeCrew: {
    label: 'Driver Drop Off Location Lat/Lon Crew',
  },
  driverDropOffLocationLatitudeLongitudePax: {
    label: 'Driver Drop Off Location Lat/Lon Pax',
  },
  transportationAdditionalInfo: {
    label: 'Transportation Additional Information',
    rules: 'string|between:0,300',
  },
  appliedDriverDropOffLocationTypeCrew: {
    label: 'Driver Drop Off Location Type - Crew',
  },
  appliedDriverDropOffLocationTypePax: {
    label: 'Driver Drop Off Location Type - Pax',
  },
  otherValue: {
    label: 'Other',
  },
  departureProceduresOtherValue: {
    label: 'Departure Procedures Location',
  },
  isOvertimeAvailable: {
    label: 'Can Overtime be requested?',
  },
  leadTimeForOvertime: {
    label: 'How far in advance does overtime need to be requested ?',
    rules: 'numeric|max:2140000000',
  },
};
