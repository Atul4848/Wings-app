import { regex } from '@wings-shared/core';
import { FAA_IMPORT_STAGING_ENTITY_TYPE } from '../../Shared';

/* istanbul ignore next */
export const runwayRules = {
  RunwayId: 'required|string|between:0,7',
  Length: 'integer|max:99999',
  Width: 'integer|max:999',
  RunwayNumber: 'string|between:0,3|required',
  Elevation: `numeric|between:0,99999.99|regex:${regex.numberWithTwoDecimal}`,
  CenterLineSpacing: 'integer|max:999',
  LandingDistanceAvailableLDA: 'integer|max:99999',
  PCN: `string|between:0,12|regex:${regex.stringWithSlash}`,
  Obstructions: 'string|between:0,200',
  VisualGlideAngle: `numeric|between:0,999.99|regex:${regex.numberWithTwoDecimal}`,
  WeightBearingCapSingleWheel:`numeric|between:0,9999999.99|regex:${regex.numberWithTwoDecimal}`,
  WeightBearingCapDualWheel: `numeric|between:0,9999999.99|regex:${regex.numberWithTwoDecimal}`,
  WeightBearingCapDualTandem:  `numeric|between:0,9999999.99|regex:${regex.numberWithTwoDecimal}`,
  WeightBearingCapDoubleDualTandem: 'integer|max:9999999',
  TakeOffRunAvailableTORA:'integer|max:99999',
  TakeOffDistanceAvailableTODA:'integer|max:99999',
  AccelerateStopDistanceAvailableASDA: 'integer|max:99999',
  EndDisplacedThreshold:'integer|max:9999',
}

/* istanbul ignore next */
export const airportRules = {
  // general information
  FAACode: `string|max:10|regex:${regex.alphaNumericWithoutSpaces}`,
  IATACode: `string|size:3|regex:${regex.alphaNumericWithoutSpaces}`,
  Name: 'required|string|max:100',
  CAPPSAirportName: 'required|string|max:25',

  // Airport Location Fields
  Elevation: {
    Value: 'numeric|between:-99999.9,99999.9|onePlaceDecimalWithZero',
  },
  MagneticVariation: 'string|max:5',
  Latitude: 'latitudeValidator',
  Longitude: 'longitudeValidator',

  // Retail base field
  SourceLocationId: 'required|string|max:11',

  // OwenShip fields
  AirportManagerName: 'string|max:200',
  AirportManagerAddress: {
    AddressLine1: 'string|max:80',
    AddressLine2: 'string|max:40',
    ZipCode: 'string|max:20',
    Email: 'string|email|max: 200',
    Phone: 'string|between:0,25',
  },
  AirportOwnerName: 'string|max:200',
  AirportOwnerAddress: {
    AddressLine1: 'string|max:80',
    AddressLine2: 'string|max:40',
    ZipCode: 'string|max:20',
    Email: 'string|email|max: 200',
    Phone: 'string|between:0,25',
  },
};

/* istanbul ignore next */
export const frequencyRules = { Frequency: 'string|max:25' };

/* istanbul ignore next */
export const mapFaaScreenRules = {
  [FAA_IMPORT_STAGING_ENTITY_TYPE.AIRPORT]: airportRules,
  [FAA_IMPORT_STAGING_ENTITY_TYPE.RUNWAYS]: runwayRules,
  [FAA_IMPORT_STAGING_ENTITY_TYPE.FREQUENCY]: frequencyRules,
};
