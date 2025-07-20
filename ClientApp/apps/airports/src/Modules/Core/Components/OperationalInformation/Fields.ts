import { EntityMapModel, regex } from '@wings-shared/core';
import moment from 'moment';
/* istanbul ignore next */
export const fields = {
  isGAFriendly: {
    label: 'GA Friendly',
  },
  isRuralAirport: {
    label: 'Rural Airport',
  },
  isDesignatedPointOfEntry: {
    label: 'Designated Point of Entry (No BOE)',
  },
  unattended: {
    label: 'Unattended',
  },
  airportDiagramBlobUrl: {
    label: 'Airport Diagram',
  },
  airportA2GAgentProfileBlobUrl: {
    label: 'A2G Agent Profile',
  },
  isForeignBasedEntity: {
    label: 'Foreign Based Entity',
  },
  jurisdiction: {
    label: 'Jurisdiction',
  },
  weightUOM: {
    label: 'Weight UOM',
  },
  customers: {
    label: 'Customers',
    value: [],
  },
  airportCategory: {
    label: 'Airport Category',
  },
  metro: {
    label: 'Metro Area',
  },
  appliedLargeAircraftRestrictions: {
    label: 'Large Aircraft Restriction',
    value: [],
  },
  commercialTerminalAddress: {
    label: 'Commercial Terminal Address',
    rules: 'string|max:300',
  },
  tdWeekdayMorningRushHour: {
    label: 'Time to Downtown - Weekday Morning Rush Hour',
    rules: 'numeric|digits_between:1,3',
  },
  tdWeekdayAfternoonRushHour: {
    label: 'Time to Downtown - Weekday Afternoon Rush Hour',
    rules: 'numeric|digits_between:1,3',
  },
  tdWeekend: {
    label: 'Time to Downtown - Weekends',
    rules: 'numeric|digits_between:1,3',
  },
  allOtherTimes: {
    label: 'Time to Downtown - All Other Times',
    rules: 'numeric|digits_between:1,3',
  },
  worldAwareLocationId: {
    label: 'WorldAware Location ID',
    rules: 'numeric|digits_between:1,5',
  },
  isMandatoryHandling: {
    label: 'Mandatory Handling',
  },
  weightLimit: {
    label: 'Weight Limit - MTOM / MTOW',
    rules: 'numeric|digits_between:1,6',
  },
  wingspanLimit: {
    label: 'Wingspan Limit (Meters)',
    rules: `numeric|regex:${regex.wingspanLimit}`,
  },
  weatherReportingSystem: {
    label: 'Weather Reporting System',
  },
  isOwnTowbarRequired: {
    label: 'Must have own towbar',
  },
  airportARFFCertification: {
    fields: {
      classCode: {
        label: 'Class Code',
      },
      certificateCode: {
        label: 'Certificate Code',
      },
      serviceCode: {
        label: 'Service Code',
      },
      certificationDate: {
        label: 'Certification Date',
      },
      isHigherCategoryAvailableOnRequest: {
        label: 'Higher Category Available on Request',
      },
    },
  },
  noise: {
    fields: {
      noiseAbatementProcedure: {
        label: 'Noise Abatement Procedure',
      },
      noiseAbatementContact: {
        label: 'Noise Abatement Contact',
        rules: `regex:${regex.phoneNumberWithHyphen}`,
      },
    },
  },
  fuel: {
    fields: {
      appliedFuelTypes: {
        label: 'Fuel Types',
        value: [],
      },
      appliedOilTypes: {
        label: 'Oil Types',
        value: [],
      },
      fuelingFacilities: {
        label: 'Fueling Facilities',
        rules: 'string|between:0,200',
      },
      fuelingHours: {
        label: 'Fueling Hours',
        rules: 'string|between:0,200',
      },
    },
  },
  airportParking: {
    fields: {
      airportSeasonalParking: {
        label: 'Seasonal Parking Difficulties',
        value: [],
      },
      overnightParking: {
        label: 'Overnight Parking Difficulties',
      },
      maximumParkingDuration: {
        label: 'Maximum Parking Duration',
        rules: 'integer|between:0,9999999',
      },
      appliedParkingAlternateAirports: {
        label: 'Parking Alternates',
        value: [],
      },
    },
  },
};

export const monthOptions = () => {
  return moment
    .months()
    .map(
      (name: string, index: number) =>
        new EntityMapModel({ name, entityId: index + 1 })
    );
};
