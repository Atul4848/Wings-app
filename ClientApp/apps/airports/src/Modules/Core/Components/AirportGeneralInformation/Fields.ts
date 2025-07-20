import { regex } from '@wings-shared/core';
import { auditFields } from '@wings/shared';
/* istanbul ignore next */
export const fields = {
  ...auditFields,
  // general information
  icaoCode: {
    label: 'ICAO Code*',
    rules: 'required',
  },
  uwaAirportCode: {
    label: 'UWA Code*',
    rules: 'required',
  },
  iataCode: {
    label: 'IATA Code',
    rules: `string|size:3|regex:${regex.alphaNumericWithoutSpaces}`,
  },
  name: {
    label: 'Name*',
    rules: 'required|string|max:100',
  },
  cappsAirportName: {
    label: 'CAPPS Airport Name*',
    rules: 'required|string|max:25',
  },
  airportFacilityType: {
    label: 'Airport Facility Type',
  },
  airportFacilityAccessLevel: {
    label: 'Airport Facility Access Level*',
    rules: 'required',
  },
  appliedAirportType: {
    label: 'Airport Type',
  },
  militaryUseType: {
    label: 'Military Use Type',
  },
  appliedAirportUsageType: {
    label: 'Airport Usage Type*',
    rules: 'required',
    value: [],
  },
  airportOfEntry: {
    label: 'Airport Of Entry (AOE)',
  },
  isTopUsageAirport: {
    label: 'Top Usage Airport',
  },
  primaryRunway: {
    label: 'Primary Runway at Airport',
  },
  inactiveReason: {
    label: 'Inactive Reason',
    rules: 'string|max:300',
  },

  airportLocation: {
    fields: {
      country: {
        label: 'Country*',
        rules: 'required',
      },
      state: {
        label: 'State',
      },
      city: {
        label: 'City*',
        rules: 'required',
      },
      closestCity: {
        label: 'Closest City*',
        rules: 'required',
      },
      island: {
        label: 'Island',
      },
      elevation: {
        fields: {
          value: {
            label: 'Elevation',
            rules: 'numeric|between:-99999.9,99999.9|onePlaceDecimalWithZero',
          },
        },
      },
      elevationUOM: {
        // required based on elevation value
        label: 'Elevation UOM',
      },
      distanceToDowntown: {
        fields: {
          value: {
            label: 'Distance to Downtown',
            rules: 'numeric|between:0,99.9|twoDecimalPlace',
          },
        },
      },
      distanceUOM: {
        // required based on distanceToDowntown value
        label: 'Distance to Downtown UOM',
      },
      airportDirection: {
        label: 'Airport Direction From City',
      },
      magneticVariation: {
        label: 'Magnetic Variation And Direction',
        rules: 'string|max:5',
      },
    },
  },
  // Retail base fields
  airportDataSource: {
    label: 'Data Source*',
    rules: 'required',
  },
  sourceLocationId: {
    label: 'Source Location Id*',
    rules: 'required|string|max:11',
  },
  faaCode: {
    label: 'FAA Code',
    rules: `string|max:5|regex:${regex.alphaNumericWithoutSpaces}`,
  },
  regionalAirportCode: {
    label: 'Regional Code',
  },
  latitudeCoordinate: {
    fields: {
      latitude: {
        label: 'Latitude',
        validators: ({ field }) => {
          return [ Boolean(field.value) ? regex.latitude.test(field.value) : true, 'Invalid Latitude format.' ];
        },
      },
    },
  },
  longitudeCoordinate: {
    fields: {
      longitude: {
        label: 'Longitude',
        validators: ({ field }) => {
          return [ Boolean(field.value) ? regex.longitude.test(field.value) : true, 'Invalid Longitude format.' ];
        },
      },
    },
  },
  accessLevel: {
    label: 'Access Level*',
    rules: 'required',
    placeholder: 'Select Access Level',
  },
  status: {
    label: 'Status*',
    rules: 'required',
    placeholder: 'Select Status',
  },
  sourceType: {
    label: 'Source Type*',
    rules: 'required',
    placeholder: 'Select Source Type',
  },
};
