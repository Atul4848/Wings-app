import { regex } from '@wings-shared/core';
import { auditFields } from '@wings/shared';

export const fields = {
  serialNumber: {
    label: 'Serial Number*',
    rules: 'required|string|between:0,15',
  },
  manufactureDate: {
    label: 'Manufacture Date',
    rules: 'string',
  },
  aircraftNationality: {
    label: 'Aircraft Nationality',
  },
  airframeUplinkVendors: {
    label: 'Uplink Vendor',
    values: [],
  },
  airframeCateringHeatingElements: {
    label: 'Catering Heating Element',
    values: [],
  },
  acas: {
    label: 'ACAS II / TCAS II Version',
  },
  beacon406MHzELTId: {
    label: '406 MHz ELT Beacon ID',
    rules: 'string|between:0,16',
  },
  isVerificationComplete: {
    label: 'Verification Complete*',
    rules: 'required',
  },
  crewSeatCap: {
    label: 'Crew Seat Cap',
    rules: 'required|integer|between:1,999',
  },
  paxSeatCap: {
    label: 'Pax Seat Cap',
    rules: 'required|integer|between:1,999',
  },
  tirePressureMain: {
    label: 'Tire Pressure Main',
    rules: 'string|between:0,4',
  },
  tirePressureNose: {
    label: 'Tire Pressure Nose',
    rules: 'string|between:0,4',
  },
  seatConfiguration: {
    label: 'Seat Configuration',
    rules: `string|between:1,2048|regex:${regex.urlV2}`,
  },
  genericAircraftCode: {
    label: 'Generic Aircraft Code',
    rules: 'string|between:0,50',
  },
  airframeStatus: {
    label: 'Airframe Status*',
    rules: 'required',
  },
  aircraftVariation: {
    label: 'Aircraft Variation*',
    rules: 'required',
  },
  engineSerialNumbers: {
    value: [],
    rules: 'required',
  },
  airframeWeightAndLength: {
    fields: {
      maxLandingWeight: {
        label: 'Max Landing Weight',
        rules: 'integer|between:1,999999',
      },
      basicOperatingWeight: {
        label: 'Basic Operating Weight(BOW)',
        rules: 'integer|between:1,999999',
      },
      bowCrewCount: {
        label: 'BOW Crew Count',
        rules: 'integer|between:1,99',
      },
      maxTakeOffWeight: {
        label: 'Max Take Off Weight(MTOW)',
        rules: 'integer|between:1,999999',
      },
      maxTakeOffFuel: {
        label: 'Max Take Off Fuel(MTOF)',
        rules: 'integer|between:1,999999',
      },
      zeroFuelWeight: {
        label: 'Zero Fuel Weight (ZFW)',
        rules: 'integer|between:1,999999',
      },
      weightUOM: {
        label: 'Weight UOM',
      },
      aeroplaneReferenceFieldLength: {
        label: 'Aeroplane Reference Field Length',
        rules: 'integer|between:1,999',
      },
      wingspan: {
        label: 'Wingspan',
        rules: 'integer|between:1,999',
      },
      outerMainGearWheelSpan: {
        label: 'Outer Main Gear Wheel Span',
      },
      distanceUOM: {
        label: 'Distance UOM',
      },
    },
  },
  airframeCapability: {
    fields: {
      minimumRunwayLengthInFeet: {
        label: 'Minimum Runway Length',
        rules: 'integer|between:1,999999',
      },
      rangeInNM: {
        label: 'Range NM',
        rules: 'integer|between:1,999999',
      },
      rangeInMin: {
        label: 'Range Minutes',
        rules: 'integer|between:1,999999',
      },
      cappsRange: {
        label: 'CAPPS Range',
        rules: 'string|between:1,15',
      },
      maxCrossWindInKnots: {
        label: 'Max Cross Wind',
        rules: 'integer|between:1,9999',
      },
      maxTailWindInKnots: {
        label: 'Max Tail Wind',
        rules: 'integer|between:1,9999',
      },
      noiseChapter: {
        label: 'Noise Chapter*',
        rules: 'required',
      },
      qcNoise: {
        label: 'QC Noise ',
        rules: 'integer|between:1,9999',
      },
      approachEPNDb: {
        label: 'Approach EPNDb',
        rules: `numeric|between:1,999.99|regex:${regex.numberWithTwoDecimal}`,
      },
      flyoverEPNDb: {
        label: 'Flyover EPNDb',
        rules: `numeric|between:1,999.99|regex:${regex.numberWithTwoDecimal}`,
      },
      lateralEPNDb: {
        label: 'Lateral EPNDb',
        rules: `numeric|between:1,999.99|regex:${regex.numberWithTwoDecimal}`,
      },
    },
  },
  accessLevel: {
    label: 'Access Level*',
    rules: 'required',
  },
  sourceType: {
    label: 'Source Type',
  },
  status: {
    label: 'Status*',
    rules: 'required',
  },
  airworthinessRecentDate: {
    label: 'Airworthiness Date (Most Recent)*',
  },
  airworthinessCertificateDate: {
    label: 'Airworthiness Date (1st Individual Certificate of Airworthiness)*',
  },
  airframeRegistries: {
    value: [],
    rules: 'required',
  },
  ...auditFields,
};
