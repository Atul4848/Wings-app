import { auditFields } from '@wings/shared';

export const fields = {
  registry: {
    label: 'Registry Name',
  },
  registryStartDate: {
    label: 'Registry Start Date',
  },
  registryEndDate: {
    label: 'Registry End Date',
  },
  isDummyRegistry: {
    label: 'Dummy Registry',
  },
  wakeTurbulenceGroup: {
    label: 'Wake Turbulence Group',
  },
  acas: {
    label: 'ACAS',
  },
  airframe: {
    label: 'Airframe',
  },
  isOceanicClearanceEnabled: {
    label: 'Oceanic Clearance Enabled',
  },
  isPDCRegistered: {
    label: 'PDC Registered',
  },
  item10B: {
    label: 'ADS-C',
    value : [],
  },
  transponderType: {
    label: 'Transponder',
  },
  adsb: {
    label: 'ADS-B',
  },
  uat: {
    label: ' ',
  },
  udlModel4: {
    label: ' ',
  },
  item19: {
    label: 'Item 19',
    value: [],
  },
  registryNationality: {
    label: 'Registry Nationality',
  },
  item10AOptions: {
    label: 'Item 10A Options',
  },
  usCustomsDecal: {
    fields: {
      number: {
        label: 'Number',
      },
      expirationDate: {
        label: 'Expiration Date',
      },
    },
  },
  weights: {
    fields: {
      bow: {
        label: 'Bow',
      },
      maxLandingWeight: {
        label: 'Max Landing Weight',
      },
      tankCapacity: {
        label: 'Tank Capacity',
      },
      zeroFuelWeight: {
        label: 'Zero Fuel Weight',
      },
      mtow: {
        label: 'MTOW',
      },
    },
  },
  distance: {
    fields: {
      minimumRunwayLength: {
        label: 'Minimum Runway Length',
      },
    },
  },
  item10A: {
    label: 'Item 10A',
    value: [],
  },
  item18: {
    fields: {
      aircraftAddressCode: { label: 'Aircraft Address Code' },
    },
  },
  wordLimitation: {
    fields: {
      maximumCrosswind: { label: 'Maximum Cross Wind' },
      maximumTailwind: { label: 'MaximumTailWind' },
    },
  },
  ...auditFields,
};
