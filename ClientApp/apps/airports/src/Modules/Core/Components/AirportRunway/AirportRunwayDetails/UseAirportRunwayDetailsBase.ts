import {
  AirportSettingsStore,
  RunwaySettingsTypeModel,
  AirportModel,
} from '../../../../Shared';
import { fields } from './Fields';
import { useParams } from 'react-router';
import {
  DATE_FORMAT,
  Utilities,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import { ModelStatusOptions, useBaseUpsertComponent } from '@wings/shared';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';

export const useAirportRunwayDetailsBase = (
  selectedAirport: AirportModel,
  airportSettingsStore: AirportSettingsStore,
  hasBaseRunwayNumber: boolean,
  hasReciprocalRunwayNumber: boolean
) => {
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, fields, baseEntitySearchFilters);
  const _airportSettingStore = airportSettingsStore as AirportSettingsStore;

  const isStatusDisabled = Utilities.getNumberOrNullValue(params?.runwayId) === selectedAirport?.id;

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: 'Runway',
        inputControls: [
          {
            fieldKey: 'runwayId',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'runwayLength',
            type: EDITOR_TYPES.TEXT_FIELD,
            isNumber: true,
          },
          {
            fieldKey: 'width',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'elevation',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'centerLineSpacing',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'statusDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
            allowKeyboardInput: false,
          },
          {
            fieldKey: 'runwaySurfaceTreatment',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.runwaySurfaceTreatments,
          },
          {
            fieldKey: 'runwaySurfacePrimaryType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.runwaySurfaceTypes,
          },
          {
            fieldKey: 'runwaySurfaceSecondaryType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.runwaySurfaceTypes,
          },
          {
            fieldKey: 'runwayLightType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.runwayLightTypes,
          },
          {
            fieldKey: 'runwayCondition',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.runwayConditions,
          },
          {
            fieldKey: 'runwayUsageType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.runwayUsageTypes,
          },
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.accessLevels,
          },
          {
            fieldKey: 'sourceType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.sourceTypes,
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            options: ModelStatusOptions,
            isDisabled: isStatusDisabled,
          },
        ],
      },
      {
        title: 'Runway Details',
        inputControls: [
          {
            fieldKey: 'titleFields.blankSpace',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'titleFields.base',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'titleFields.reciprocal',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'titleFields.runwayNumber',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.runwayNumber',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
          },
          {
            fieldKey: 'reciprocal.runwayNumber',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
          },
          {
            fieldKey: 'titleFields.visualGlideAngle',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.visualGlideAngle',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.visualGlideAngle',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.appliedRunwayRVRs',
            type: EDITOR_TYPES.LABEL,
            showTooltip: true,
            tooltipText: 'Runway Visual Range',
          },
          {
            fieldKey: 'base.appliedRunwayRVRs',
            type: EDITOR_TYPES.DROPDOWN,
            showLabel: false,
            options: _airportSettingStore.runwayRVR,
            multiple: true,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.appliedRunwayRVRs',
            type: EDITOR_TYPES.DROPDOWN,
            showLabel: false,
            options: _airportSettingStore.runwayRVR,
            multiple: true,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.rvv',
            type: EDITOR_TYPES.LABEL,
            showTooltip: true,
            tooltipText: 'Runway Visual Value',
          },
          {
            fieldKey: 'base.rvv',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.rvv',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.reil',
            type: EDITOR_TYPES.LABEL,
            showTooltip: true,
            tooltipText: 'Runway End Identifier Lights',
          },
          {
            fieldKey: 'base.reil',
            type: EDITOR_TYPES.SELECT_CONTROL,
            showLabel: false,
            isBoolean: true,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.reil',
            type: EDITOR_TYPES.SELECT_CONTROL,
            showLabel: false,
            isBoolean: true,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.centerlineLights',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.centerlineLights',
            type: EDITOR_TYPES.SELECT_CONTROL,
            showLabel: false,
            isBoolean: true,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.centerlineLights',
            type: EDITOR_TYPES.SELECT_CONTROL,
            showLabel: false,
            isBoolean: true,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.touchdownLights',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.touchdownLights',
            type: EDITOR_TYPES.SELECT_CONTROL,
            showLabel: false,
            isBoolean: true,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.touchdownLights',
            type: EDITOR_TYPES.SELECT_CONTROL,
            showLabel: false,
            isBoolean: true,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.pcn',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.pcn',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.pcn',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.weightBearingCapSingleWheel',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.weightBearingCapSingleWheel',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.weightBearingCapSingleWheel',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.weightBearingCapDualWheel',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.weightBearingCapDualWheel',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.weightBearingCapDualWheel',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.weightBearingCapDualTandem',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.weightBearingCapDualTandem',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.weightBearingCapDualTandem',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.weightBearingCapDoubleDualTandem',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.weightBearingCapDoubleDualTandem',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.weightBearingCapDoubleDualTandem',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.takeOffRunAvailableTORA',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.takeOffRunAvailableTORA',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.takeOffRunAvailableTORA',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.takeOffDistanceAvailableTODA',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.takeOffDistanceAvailableTODA',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.takeOffDistanceAvailableTODA',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },

          {
            fieldKey: 'titleFields.accelerateStopDistanceAvailableASDA',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.accelerateStopDistanceAvailableASDA',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.accelerateStopDistanceAvailableASDA',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.landingDistanceAvailableLDA',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.landingDistanceAvailableLDA',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.landingDistanceAvailableLDA',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.estimateforDoubleDualTandemWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.estimateforDoubleDualTandemWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.estimateforDoubleDualTandemWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.estimateforDualTandemWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.estimateforDualTandemWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.estimateforDualTandemWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },

          {
            fieldKey: 'titleFields.estimateforDualWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.estimateforDualWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.estimateforDualWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.estimateforSingleWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.estimateforSingleWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.estimateforSingleWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.endDisplacedThreshold',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.endDisplacedThreshold',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
            isNumber: true,
          },
          {
            fieldKey: 'reciprocal.endDisplacedThreshold',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
            isNumber: true,
          },
          {
            fieldKey: 'titleFields.edgeLights',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.edgeLights',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.edgeLights',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.endLights',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.endLights',
            type: EDITOR_TYPES.CHECKBOX,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.endLights',
            type: EDITOR_TYPES.CHECKBOX,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.obstructions',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.obstructions',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.obstructions',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.runwayApproachLight',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.runwayApproachLight',
            type: EDITOR_TYPES.DROPDOWN,
            showLabel: false,
            showTooltip: true,
            options: _airportSettingStore.runwayApproachLight,
            isDisabled: !hasBaseRunwayNumber,
            getOptionLabel: option => (option as RunwaySettingsTypeModel)?.settingCode,
            getOptionTooltip: option => (option as RunwaySettingsTypeModel)?.name,
          },
          {
            fieldKey: 'reciprocal.runwayApproachLight',
            type: EDITOR_TYPES.DROPDOWN,
            showLabel: false,
            showTooltip: true,
            options: _airportSettingStore.runwayApproachLight,
            isDisabled: !hasReciprocalRunwayNumber,
            getOptionLabel: option => (option as RunwaySettingsTypeModel)?.settingCode,
            getOptionTooltip: option => (option as RunwaySettingsTypeModel)?.name,
          },
          {
            fieldKey: 'titleFields.runwayVGSI',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.runwayVGSI',
            type: EDITOR_TYPES.DROPDOWN,
            showLabel: false,
            options: _airportSettingStore.runwayVGSI,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.runwayVGSI',
            type: EDITOR_TYPES.DROPDOWN,
            showLabel: false,
            options: _airportSettingStore.runwayVGSI,
            isDisabled: !hasReciprocalRunwayNumber,
          },
          {
            fieldKey: 'titleFields.appliedRunwayApproachTypes',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.appliedRunwayApproachTypes',
            type: EDITOR_TYPES.DROPDOWN,
            showLabel: false,
            options: _airportSettingStore.runwayApproachType,
            multiple: true,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.appliedRunwayApproachTypes',
            type: EDITOR_TYPES.DROPDOWN,
            showLabel: false,
            options: _airportSettingStore.runwayApproachType,
            multiple: true,
            isDisabled: !hasReciprocalRunwayNumber,
          },

          {
            fieldKey: 'titleFields.appliedRunwayNavaids',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.appliedRunwayNavaids',
            type: EDITOR_TYPES.DROPDOWN,
            showLabel: false,
            options: _airportSettingStore.runwayNavaids,
            multiple: true,
            isDisabled: !hasBaseRunwayNumber,
          },
          {
            fieldKey: 'reciprocal.appliedRunwayNavaids',
            type: EDITOR_TYPES.DROPDOWN,
            showLabel: false,
            options: _airportSettingStore.runwayNavaids,
            multiple: true,
            isDisabled: !hasReciprocalRunwayNumber,
          },
        ],
      },
      {
        title: 'Audit Details',
        isHidden: useUpsert.isEditable,
        inputControls: [ ...useUpsert.auditFields ],
      },
    ];
  };

  return {
    groupInputControls,
  };
};
