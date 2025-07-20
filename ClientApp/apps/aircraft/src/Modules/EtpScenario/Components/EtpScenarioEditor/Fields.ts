import { regex } from '@wings-shared/core';
import { auditFields } from '@wings/shared';

export const fields = {
  etpScenarioEngine: {
    label: 'Scenario Engine*',
    rules: 'required',
  },
  etpScenarioType: {
    label: 'Scenario Type',
  },
  etpTimeLimitType: {
    label: 'Time Limit Type',
  },
  weightUom: {
    label: 'Weight UOM*',
    rules: 'required',
  },
  etpScenarioNumber: {
    label: 'ETP Scenario Number*',
    rules: 'required|numeric|between:1,999',
  },
  nfpScenarioNumber: {
    label: 'NFP Scenario Number*',
    rules: 'required|numeric|between:1,999',
  },
  description: {
    label: 'Description*',
    rules: 'required|string|between:1,500',
  },
  comments: {
    label: 'Comments',
    rules: 'string|between:1,500',
  },
  extRangeEntryPointRadius: {
    label: 'Extended Range Entry Point Radius',
    rules: 'numeric|between:1,9999',
  },
  etpInitialDescent: {
    fields: {
      etpMainDescent: {
        label: 'Main Descent*',
        rules: 'required',
      },
      etpAltDescent: {
        label: 'Alt Descent',
      },
      etpLevelOff: {
        label: 'Level Off',
      },
      normalProfile: {
        label: 'Normal Profile',
        rules: 'between:1,6',
      },
      icingProfile: {
        label: 'Icing Profile',
        rules: 'between:1,6',
      },
      fixedTime: {
        label: 'Fixed Time',
        rules: 'digits_between:1,2',
      },
      fixedBurn: {
        label: 'Fixed Burn',
        rules: 'digits_between:1,5',
      },
      fixedDistance: {
        label: 'Fixed Distance',
        rules: 'digits_between:1,3',
      },
      flightLevel: {
        label: 'Flight Level',
        rules: `numeric|min:3|between:020,700|regex:${regex.divisbleByFive}`,
      },
    },
  },
  etpHold: {
    fields: {
      etpHoldMethod: {
        label: 'Hold Method*',
        rules: 'required',
      },
      time: {
        label: 'Time*',
        rules: 'required|numeric|between:1,99',
      },
      flightLevel: {
        label: 'Flight Level*',
        rules: 'required|numeric|between:010,250',
      },
      burn: {
        label: 'Burn',
        rules: 'numeric|between:1,99999',
      },
    },
  },
  etpMissedApproach: {
    fields: {
      time: {
        label: 'Time',
        rules: 'numeric|between:0,99',
      },
      burn: {
        label: 'Burn',
        rules: 'numeric|between:0,99999',
      },
      distance: {
        label: 'Distance',
        rules: 'numeric|between:0,999',
      },
    },
  },
  etpApuBurn: {
    fields: {
      etpApuBurnMethod: {
        label: 'Burn Method',
      },
      time: {
        label: 'Time',
        rules: 'numeric|between:1,999',
      },
      burn: {
        label: 'Burn',
        rules: 'numeric|between:0,99999',
      },
    },
  },
  etpFinalDescentBurn: {
    fields: {
      etpFinalDescentBurnMethod: {
        label: 'Final Descent Burn Method*',
        rules: 'required',
      },
      time: {
        label: 'Time',
        rules: 'numeric|between:1,99',
      },
      burn: {
        label: 'Burn',
        rules: 'numeric|between:1,99999',
      },
      distance: {
        label: 'Distance',
        rules: 'numeric|between:0,999',
      },
    },
  },
  cruiseEtpProfile: {
    fields: {
      etpCruise: {
        label: 'Cruise Profile',
      },
      maxFlightLevel: {
        label: 'Max Flight Level',
        rules: `numeric|min:3|between:020,700|regex:${regex.divisbleByFive}`,
      },
      maxFlightLevelIncrement: {
        label: 'Max Flight Level Increment',
        rules: `numeric|min:3|between:020,700|regex:${regex.divisbleByFive}`,
      },
      maxFlightLevelIncrementLimit: {
        label: 'Max Flight Level Increment Limit',
        rules: `numeric|min:3|between:020,700|regex:${regex.divisbleByFive}`,
      },
      additionalMaxFlightLevel1: {
        label: 'Additional 1 Max Flight Level',
        rules: `numeric|min:3|between:020,700|regex:${regex.divisbleByFive}`,
      },
      additionalTime1: {
        label: 'Additional 1 Time',
        rules: 'numeric|between:1,998',
      },
      additionalMaxFlightLevel2: {
        label: 'Additional 2 Max Flight Level',
        rules: `numeric|min:3|between:020,700|regex:${regex.divisbleByFive}`,
      },
      additionalTime2: {
        label: 'Additional 2 Time',
        rules: 'numeric|between:1,998',
      },
      speed: {
        label: 'Speed',
        rules: 'between:1,6',
      },
    },
  },
  ...auditFields,
};
