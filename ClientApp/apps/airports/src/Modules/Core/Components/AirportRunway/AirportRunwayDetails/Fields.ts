import { regex } from '@wings-shared/core';
import { auditFields } from '@wings/shared';
export const fields = {
  runwayId: {
    label: 'Runway Id*',
    rules: 'required|string|between:0,7',
  },
  runwayLength: {
    label: 'Length (Feet)',
    rules: 'integer|max:99999',
  },
  width: {
    label: 'Width (Feet)',
    rules: 'integer|max:999',
  },
  elevation: {
    label: 'Elevation (Feet)',
    rules: `numeric|between:-99999.99,99999.99|regex:${regex.negativeNumberWithTwoDecimal}`,
  },
  centerLineSpacing: {
    label: 'Center Line Spacing',
    rules: 'integer|max:999',
  },
  statusDate: {
    label: 'Status Date',
  },
  runwaySurfaceTreatment: {
    label: 'Surface Treatment',
  },
  runwaySurfacePrimaryType: {
    label: 'Surface Type Primary',
  },
  runwaySurfaceSecondaryType: {
    label: 'Surface Type Secondary',
  },
  runwayLightType: {
    label: 'Light Type',
  },
  runwayCondition: {
    label: 'Condition',
  },
  runwayUsageType: {
    label: 'Runway Usage Type',
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
  base: {
    fields: {
      runwayNumber: {
        label: 'Runway Number',
        rules: 'string|between:0,3',
      },
      visualGlideAngle: {
        label: 'Visual Glide Angle',
        rules: `numeric|between:0,999.99|regex:${regex.numberWithTwoDecimal}`,
      },
      rvv: { label: 'RVV' },
      reil: { label: 'REIL', value: null },
      centerlineLights: { label: 'Centerline Lights' },
      touchdownLights: { label: 'Touchdown Lights' },
      pcn: {
        label: 'PCN',
        rules: 'string|between:0,12',
        validators: ({ field, form }) => {
          return [
            Boolean(field.value) ? regex.stringWithSlash.test(field.value) : true,
            'Only string and / is allowed.',
          ];
        },
      },
      weightBearingCapSingleWheel: {
        label: 'Weight Bearing Cap Single Wheel (Pounds)',
        rules: `numeric|between:0,9999999.99|regex:${regex.numberWithTwoDecimal}`,
      },
      weightBearingCapDualWheel: {
        label: 'Weight Bearing Cap Dual Wheel (Pounds)',
        rules: `numeric|between:0,9999999.99|regex:${regex.numberWithTwoDecimal}`,
      },
      weightBearingCapDualTandem: {
        label: 'Weight Bearing Cap Dual Tandem (Pounds)',
        rules: `numeric|between:0,9999999.99|regex:${regex.numberWithTwoDecimal}`,
      },
      weightBearingCapDoubleDualTandem: {
        label: 'Weight Bearing Cap Double Dual Tandem (Pounds)',
        rules: 'integer|max:9999999',
      },
      takeOffRunAvailableTORA: { label: 'Take Off Run Available TORA', rules: 'integer|max:99999' },
      takeOffDistanceAvailableTODA: { label: 'Take Off Distance Available TODA', rules: 'integer|max:99999' },
      accelerateStopDistanceAvailableASDA: {
        label: 'Accelerate Stop Distance Available ASDA',
        rules: 'integer|max:99999',
      },
      landingDistanceAvailableLDA: { label: ' Landing Distance Available LDA ', rules: 'integer|max:99999' },
      estimateforDoubleDualTandemWheelAircraftWeightBearingCapacity: {
        label: 'Estimate for Double Dual Tandem Wheel Aircraft Weight-Bearing Capacity',
        rules: 'integer|max:9999999',
      },
      estimateforDualTandemWheelAircraftWeightBearingCapacity: {
        label: 'Estimate for Dual Tandem Wheel Aircraft Weight-Bearing Capacity',
        rules: 'integer|max:9999999',
      },
      estimateforDualWheelAircraftWeightBearingCapacity: {
        label: 'Estimate for Dual Wheel Aircraft Weight-Bearing Capacity',
        rules: 'integer|max:9999999',
      },
      estimateforSingleWheelAircraftWeightBearingCapacity: {
        label: 'Estimate for Single Wheel Aircraft Weight-Bearing Capacity',
        rules: 'integer|max:9999999',
      },
      endDisplacedThreshold: { label: 'End Displaced Threshold (US and Territories)', rules: 'integer|max:9999' },
      edgeLights: { label: 'Edge Lights', rules: 'integer|max:999' },
      endLights: { label: 'End Lights' },
      obstructions: { label: 'Obstructions', rules: 'string|between:0,200' },
      runwayType: { label: 'Runway Type' },
      runwayApproachLight: { label: 'Approach Lights' },
      runwayVGSI: { label: 'VIS G/S' },
      appliedRunwayApproachTypes: { label: 'ILS Approach Type', value: [] },
      appliedRunwayRVRs: { label: 'RVR', value: [] },
      appliedRunwayNavaids: { label: 'Navaids', value: [] },
    },
  },
  reciprocal: {
    fields: {
      runwayNumber: {
        label: 'Runway Number',
        rules: 'string|between:0,3',
      },
      visualGlideAngle: {
        label: 'Visual Glide Angle',
        rules: `numeric|between:0,999.99|regex:${regex.numberWithTwoDecimal}`,
      },
      rvv: { label: 'RVV' },
      reil: { label: 'REIL', value: null },
      centerlineLights: { label: 'Centerline Lights' },
      touchdownLights: { label: 'Touchdown Lights' },
      pcn: {
        label: 'PCN',
        rules: 'string|between:0,12',
        validators: ({ field, form }) => {
          return [
            Boolean(field.value) ? regex.stringWithSlash.test(field.value) : true,
            'Only string and / is allowed.',
          ];
        },
      },
      weightBearingCapSingleWheel: {
        label: 'Weight Bearing Cap Single Wheel (Pounds)',
        rules: `numeric|between:0,9999999.99|regex:${regex.numberWithTwoDecimal}`,
      },
      weightBearingCapDualWheel: {
        label: 'Weight Bearing Cap Dual Wheel (Pounds)',
        rules: `numeric|between:0,9999999.99|regex:${regex.numberWithTwoDecimal}`,
      },
      weightBearingCapDualTandem: {
        label: 'Weight Bearing Cap Dual Tandem (Pounds)',
        rules: `numeric|between:0,9999999.99|regex:${regex.numberWithTwoDecimal}`,
      },
      weightBearingCapDoubleDualTandem: {
        label: 'Weight Bearing Cap Double Dual Tandem (Pounds)',
        rules: 'integer|max:9999999',
      },
      takeOffRunAvailableTORA: { label: 'Take Off Run Available TORA', rules: 'integer|max:99999' },
      takeOffDistanceAvailableTODA: { label: 'Take Off Distance Available TODA', rules: 'integer|max:99999' },
      accelerateStopDistanceAvailableASDA: {
        label: 'Accelerate Stop Distance Available ASDA',
        rules: 'integer|max:99999',
      },
      landingDistanceAvailableLDA: { label: ' Landing Distance Available LDA ', rules: 'integer|max:99999' },
      estimateforDoubleDualTandemWheelAircraftWeightBearingCapacity: {
        label: 'Estimate for Double Dual Tandem Wheel Aircraft Weight-Bearing Capacity',
        rules: 'integer|max:9999999',
      },
      estimateforDualTandemWheelAircraftWeightBearingCapacity: {
        label: 'Estimate for Dual Tandem Wheel Aircraft Weight-Bearing Capacity',
        rules: 'integer|max:9999999',
      }, 
      estimateforDualWheelAircraftWeightBearingCapacity: {
        label: 'Estimate for Dual Wheel Aircraft Weight-Bearing Capacity',
        rules: 'integer|max:9999999',
      },
      estimateforSingleWheelAircraftWeightBearingCapacity: {
        label: 'Estimate for Single Wheel Aircraft Weight-Bearing Capacity',
        rules: 'integer|max:9999999',
      },
      endDisplacedThreshold: { label: 'End Displaced Threshold (US and Territories)', rules: 'integer|max:9999' },
      edgeLights: { label: 'Edge Lights', rules: 'integer|max:999' },
      endLights: { label: 'End Lights' },
      obstructions: { label: 'Obstructions', rules: 'string|between:0,200' },
      runwayType: { label: 'Runway Type' },
      runwayApproachLight: { label: 'Approach Lights' },
      runwayVGSI: { label: 'VIS G/S' },
      appliedRunwayApproachTypes: { label: 'ILS Approach Type', value: [] },
      appliedRunwayRVRs: { label: 'RVR', value: [] },
      appliedRunwayNavaids: { label: 'Navaids', value: [] },
    },
  },
  // For UI Only
  titleFields: {
    fields: {
      blankSpace: { label: '' },
      base: { label: 'Base' },
      reciprocal: { label: 'Reciprocal' },
      runwayNumber: { label: 'Runway Number*' },
      visualGlideAngle: { label: 'Visual Glide Angle' },
      rvv: { label: 'RVV' },
      reil: { label: 'REIL' },
      centerlineLights: { label: 'Centerline Lights' },
      touchdownLights: { label: 'Touchdown Lights' },
      pcn: { label: 'PCN' },
      weightBearingCapSingleWheel: { label: 'Weight Bearing Cap Single Wheel (Pounds)' },
      weightBearingCapDualWheel: { label: 'Weight Bearing Cap Dual Wheel (Pounds)' },
      weightBearingCapDualTandem: { label: 'Weight Bearing Cap Dual Tandem (Pounds)' },
      weightBearingCapDoubleDualTandem: { label: 'Weight Bearing Cap Double Dual Tandem (Pounds)' },
      takeOffRunAvailableTORA: { label: 'Take Off Run Available TORA' },
      takeOffDistanceAvailableTODA: { label: 'Take Off Distance Available TODA' },
      accelerateStopDistanceAvailableASDA: { label: 'Accelerate Stop Distance Available ASDA' },
      landingDistanceAvailableLDA: { label: ' Landing Distance Available LDA ' },
      estimateforDoubleDualTandemWheelAircraftWeightBearingCapacity: {
        label: 'Estimate for Double Dual Tandem Wheel Aircraft Weight-Bearing Capacity',
      },
      estimateforDualTandemWheelAircraftWeightBearingCapacity: {
        label: 'Estimate for Dual Tandem Wheel Aircraft Weight-Bearing Capacity',
      },
      estimateforDualWheelAircraftWeightBearingCapacity: {
        label: 'Estimate for Dual Wheel Aircraft Weight-Bearing Capacity',
      },
      estimateforSingleWheelAircraftWeightBearingCapacity: {
        label: 'Estimate for Single Wheel Aircraft Weight-Bearing Capacity',
      },
      endDisplacedThreshold: { label: 'End Displaced Threshold (US and Territories)' },
      edgeLights: { label: 'Edge Lights' },
      endLights: { label: 'End Lights' },
      obstructions: { label: 'Obstructions' },
      runwayType: { label: 'Runway Type' },
      runwayApproachLight: { label: 'Approach Lights' },
      runwayVGSI: { label: 'VIS G/S' },
      appliedRunwayApproachTypes: { label: 'ILS Approach Type' },
      appliedRunwayRVRs: { label: 'RVR' },
      appliedRunwayNavaids: { label: 'Navaids' },
    },
  },
  ...auditFields,
};

export const primaryRunwayField = {
  primaryRunway: {
    label: 'Primary Runway at Airport',
  },
};
