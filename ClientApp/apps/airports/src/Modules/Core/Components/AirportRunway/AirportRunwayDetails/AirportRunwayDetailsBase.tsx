import { BaseUpsertComponent, VIEW_MODE, ModelStatusOptions, AirportModel } from '@wings/shared';
import { AirportStore, AirportSettingsStore, AirportRunwayModel, RunwaySettingsTypeModel } from '../../../../Shared';
import { fields } from './Fields';
import { NavigateFunction } from 'react-router';
import { DATE_FORMAT, IClasses, Utilities } from '@wings-shared/core';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import { SidebarStore } from '@wings-shared/layout';

export interface BaseProps {
  params?: { airportId: number; icao: string; viewMode: string; runwayId: number; runwayViewMode: VIEW_MODE };
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  sidebarStore?: typeof SidebarStore;
  navigate?: NavigateFunction;
}

export class AirportRunwayDetailsBase<Props extends BaseProps> extends BaseUpsertComponent<
  BaseProps,
  AirportRunwayModel
> {
  constructor(p: BaseProps) {
    super(p, fields);
  }

  protected get airportSettingsStore(): AirportSettingsStore {
    return this.props.airportSettingsStore as AirportSettingsStore;
  }

  protected get airportStore(): AirportStore {
    return this.props.airportStore as AirportStore;
  }

  protected setFormValues(model: AirportRunwayModel): void {
    this.form.set(model);
  }

  protected get isBaseRunwayNumberValid(): boolean {
    return !Boolean(this.getField('base.runwayNumber').value);
  }

  protected get isReciprocalRunwayNumberValid(): boolean {
    return !Boolean(this.getField('reciprocal.runwayNumber').value);
  }

  private get isStatusDisabled(): boolean {
    const primaryRunway = this.airportStore.selectedAirport;
    const runwayId = this.props.params?.runwayId;
    return Utilities.getNumberOrNullValue(runwayId) === primaryRunway?.id;
  }

  /* istanbul ignore next */
  protected get groupInputControls(): IGroupInputControls[] {
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
            options: this.airportSettingsStore.runwaySurfaceTreatments,
          },
          {
            fieldKey: 'runwaySurfacePrimaryType',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.runwaySurfaceTypes,
          },
          {
            fieldKey: 'runwaySurfaceSecondaryType',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.runwaySurfaceTypes,
          },
          {
            fieldKey: 'runwayLightType',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.runwayLightTypes,
          },
          {
            fieldKey: 'runwayCondition',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.runwayConditions,
          },
          {
            fieldKey: 'runwayUsageType',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.runwayUsageTypes,
          },
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.accessLevels,
          },
          {
            fieldKey: 'sourceType',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.sourceTypes,
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            options: ModelStatusOptions,
            isDisabled: this.isStatusDisabled,
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
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.visualGlideAngle',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
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
            options: this.airportSettingsStore.runwayRVR,
            multiple: true,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.appliedRunwayRVRs',
            type: EDITOR_TYPES.DROPDOWN,
            showLabel: false,
            options: this.airportSettingsStore.runwayRVR,
            multiple: true,
            isDisabled: this.isReciprocalRunwayNumberValid,
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
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.rvv',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
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
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.reil',
            type: EDITOR_TYPES.SELECT_CONTROL,
            showLabel: false,
            isBoolean: true,
            isDisabled: this.isReciprocalRunwayNumberValid,
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
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.centerlineLights',
            type: EDITOR_TYPES.SELECT_CONTROL,
            showLabel: false,
            isBoolean: true,
            isDisabled: this.isReciprocalRunwayNumberValid,
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
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.touchdownLights',
            type: EDITOR_TYPES.SELECT_CONTROL,
            showLabel: false,
            isBoolean: true,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },
          {
            fieldKey: 'titleFields.pcn',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.pcn',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.pcn',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },
          {
            fieldKey: 'titleFields.weightBearingCapSingleWheel',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.weightBearingCapSingleWheel',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.weightBearingCapSingleWheel',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },
          {
            fieldKey: 'titleFields.weightBearingCapDualWheel',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.weightBearingCapDualWheel',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.weightBearingCapDualWheel',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },
          {
            fieldKey: 'titleFields.weightBearingCapDualTandem',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.weightBearingCapDualTandem',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.weightBearingCapDualTandem',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },
          {
            fieldKey: 'titleFields.weightBearingCapDoubleDualTandem',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.weightBearingCapDoubleDualTandem',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.weightBearingCapDoubleDualTandem',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },
          {
            fieldKey: 'titleFields.takeOffRunAvailableTORA',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.takeOffRunAvailableTORA',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.takeOffRunAvailableTORA',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },
          {
            fieldKey: 'titleFields.takeOffDistanceAvailableTODA',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.takeOffDistanceAvailableTODA',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.takeOffDistanceAvailableTODA',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },

          {
            fieldKey: 'titleFields.accelerateStopDistanceAvailableASDA',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.accelerateStopDistanceAvailableASDA',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.accelerateStopDistanceAvailableASDA',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },
          {
            fieldKey: 'titleFields.landingDistanceAvailableLDA',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.landingDistanceAvailableLDA',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.landingDistanceAvailableLDA',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },
          {
            fieldKey: 'titleFields.estimateforDoubleDualTandemWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.estimateforDoubleDualTandemWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.estimateforDoubleDualTandemWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },
          {
            fieldKey: 'titleFields.estimateforDualTandemWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.estimateforDualTandemWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.estimateforDualTandemWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },

          {
            fieldKey: 'titleFields.estimateforDualWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.estimateforDualWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.estimateforDualWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },
          {
            fieldKey: 'titleFields.estimateforSingleWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.estimateforSingleWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.estimateforSingleWheelAircraftWeightBearingCapacity',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },
          {
            fieldKey: 'titleFields.endDisplacedThreshold',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.endDisplacedThreshold',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isBaseRunwayNumberValid,
            isNumber: true,
          },
          {
            fieldKey: 'reciprocal.endDisplacedThreshold',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
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
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.edgeLights',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },
          {
            fieldKey: 'titleFields.endLights',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.endLights',
            type: EDITOR_TYPES.CHECKBOX,
            showLabel: false,
            isDisabled: this.isBaseRunwayNumberValid,
            containerClass: this.props.classes?.containerClass,
          },
          {
            fieldKey: 'reciprocal.endLights',
            type: EDITOR_TYPES.CHECKBOX,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },
          {
            fieldKey: 'titleFields.obstructions',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.obstructions',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.obstructions',
            type: EDITOR_TYPES.TEXT_FIELD,
            showLabel: false,
            isDisabled: this.isReciprocalRunwayNumberValid,
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
            options: this.airportSettingsStore.runwayApproachLight,
            isDisabled: this.isBaseRunwayNumberValid,
            getOptionLabel: option => (option as RunwaySettingsTypeModel)?.settingCode,
            getOptionTooltip: option => (option as RunwaySettingsTypeModel)?.name,
          },
          {
            fieldKey: 'reciprocal.runwayApproachLight',
            type: EDITOR_TYPES.DROPDOWN,
            showLabel: false,
            showTooltip: true,
            options: this.airportSettingsStore.runwayApproachLight,
            isDisabled: this.isReciprocalRunwayNumberValid,
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
            options: this.airportSettingsStore.runwayVGSI,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.runwayVGSI',
            type: EDITOR_TYPES.DROPDOWN,
            showLabel: false,
            options: this.airportSettingsStore.runwayVGSI,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },
          {
            fieldKey: 'titleFields.appliedRunwayApproachTypes',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.appliedRunwayApproachTypes',
            type: EDITOR_TYPES.DROPDOWN,
            showLabel: false,
            options: this.airportSettingsStore.runwayApproachType,
            multiple: true,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.appliedRunwayApproachTypes',
            type: EDITOR_TYPES.DROPDOWN,
            showLabel: false,
            options: this.airportSettingsStore.runwayApproachType,
            multiple: true,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },

          {
            fieldKey: 'titleFields.appliedRunwayNavaids',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'base.appliedRunwayNavaids',
            type: EDITOR_TYPES.DROPDOWN,
            showLabel: false,
            options: this.airportSettingsStore.runwayNavaids,
            multiple: true,
            isDisabled: this.isBaseRunwayNumberValid,
          },
          {
            fieldKey: 'reciprocal.appliedRunwayNavaids',
            type: EDITOR_TYPES.DROPDOWN,
            showLabel: false,
            options: this.airportSettingsStore.runwayNavaids,
            multiple: true,
            isDisabled: this.isReciprocalRunwayNumberValid,
          },
        ],
      },
      {
        title: 'Audit Details',
        isHidden: this.isEditable,
        inputControls: [ ...this.auditFields ],
      },
    ];
  }
}

export default AirportRunwayDetailsBase;
