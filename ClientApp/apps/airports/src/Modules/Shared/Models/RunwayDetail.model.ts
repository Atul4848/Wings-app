import { IAPIRunwayDetail } from '../Interfaces';
import {
  AccessLevelModel,
  CoreModel,
  modelProtection,
  SourceTypeModel,
  StatusTypeModel,
  Utilities,
  SettingsTypeModel,
  ISelectOption,
} from '@wings-shared/core';
import { RunwaySettingsTypeModel } from './RunwaySettingsTypeModel.model';

@modelProtection
export class RunwayDetailModel extends CoreModel implements ISelectOption {
  runwayId: number = null;
  runwayTypeId: number = null;
  runwayNumber: string = null;
  visualGlideAngle: number = null;
  rvv: boolean = null;
  reil: boolean = null;
  centerlineLights: boolean = null;
  touchdownLights: boolean = null;
  pcn: string = '';
  weightBearingCapSingleWheel: number = null;
  weightBearingCapDualWheel: number = null;
  weightBearingCapDualTandem: number = null;
  weightBearingCapDoubleDualTandem: number = null;
  takeOffRunAvailableTORA: number = null;
  takeOffDistanceAvailableTODA: number = null;
  accelerateStopDistanceAvailableASDA: number = null;
  landingDistanceAvailableLDA: number = null;
  estimateforDoubleDualTandemWheelAircraftWeightBearingCapacity: number = null;
  estimateforDualTandemWheelAircraftWeightBearingCapacity: number = null;
  estimateforDualWheelAircraftWeightBearingCapacity: number = null;
  estimateforSingleWheelAircraftWeightBearingCapacity: number = null;
  endDisplacedThreshold: number = null;
  edgeLights: number = null;
  endLights: boolean = false;
  obstructions: string = '';
  runwayType: SettingsTypeModel;
  runwayApproachLight: RunwaySettingsTypeModel;
  runwayVGSI: RunwaySettingsTypeModel;
  appliedRunwayApproachTypes: RunwaySettingsTypeModel[];
  appliedRunwayRVRs: RunwaySettingsTypeModel[];
  appliedRunwayNavaids: RunwaySettingsTypeModel[];

  constructor(data?: Partial<RunwayDetailModel>) {
    super(data);
    Object.assign(this, data);
  }

  // required for dropdown
  public get label(): string {
    if (this.runwayType?.name) {
      return `${this.runwayNumber} (${this.runwayType?.name})`;
    }

    return this.runwayNumber;
  }

  public get value(): number {
    return this.id;
  }

  public static deserialize(apiData: IAPIRunwayDetail): RunwayDetailModel {
    if (!apiData) {
      return new RunwayDetailModel();
    }
    const data: Partial<RunwayDetailModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.runwayDetailId || apiData.id,
      runwayType: SettingsTypeModel.deserialize({ ...apiData.runwayType, id: apiData.runwayType.runwayTypeId }),
      runwayTypeId: apiData.runwayType.runwayTypeId,
      runwayApproachLight: RunwaySettingsTypeModel.deserialize({
        ...apiData.runwayApproachLight,
        id: apiData.runwayApproachLight?.runwayApproachLightId || apiData.runwayApproachLight?.id,
      }),
      runwayVGSI: RunwaySettingsTypeModel.deserialize({
        ...apiData.runwayVGSI,
        id: apiData.runwayVGSI?.runwayVGSIId || apiData.runwayVGSI?.id,
      }),
      appliedRunwayApproachTypes: apiData.appliedRunwayApproachTypes?.map(a =>
        RunwaySettingsTypeModel.deserialize({ ...a.runwayApproachType, id: a.runwayApproachType?.runwayApproachTypeId })
      ),
      appliedRunwayRVRs: apiData.appliedRunwayRVRs?.map(a =>
        RunwaySettingsTypeModel.deserialize({ ...a.runwayRVR, id: a.runwayRVR?.runwayRVRId })
      ),
      appliedRunwayNavaids: apiData.appliedRunwayNavaids?.map(a =>
        RunwaySettingsTypeModel.deserialize({ ...a.runwayNavaid, id: a.runwayNavaid?.runwayNavaidId })
      ),
    };
    return new RunwayDetailModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIRunwayDetail {
    return {
      id: this.id || 0,
      runwayId: this.runwayId,
      runwayNumber: this.runwayNumber || null,
      visualGlideAngle: Utilities.getNumberOrNullValue(this.visualGlideAngle),
      rvv: this.rvv,
      reil: this.reil,
      centerlineLights: this.centerlineLights,
      touchdownLights: this.touchdownLights,
      pcn: this.pcn,
      weightBearingCapSingleWheel: Utilities.getNumberOrNullValue(this.weightBearingCapSingleWheel),
      weightBearingCapDualWheel: Utilities.getNumberOrNullValue(this.weightBearingCapDualWheel),
      weightBearingCapDualTandem: Utilities.getNumberOrNullValue(this.weightBearingCapDualTandem),
      weightBearingCapDoubleDualTandem: Utilities.getNumberOrNullValue(this.weightBearingCapDoubleDualTandem),
      takeOffRunAvailableTORA: Utilities.getNumberOrNullValue(this.takeOffRunAvailableTORA),
      takeOffDistanceAvailableTODA: Utilities.getNumberOrNullValue(this.takeOffDistanceAvailableTODA),
      accelerateStopDistanceAvailableASDA: Utilities.getNumberOrNullValue(this.accelerateStopDistanceAvailableASDA),
      landingDistanceAvailableLDA: Utilities.getNumberOrNullValue(this.landingDistanceAvailableLDA),
      estimateforDoubleDualTandemWheelAircraftWeightBearingCapacity: Utilities.getNumberOrNullValue(
        this.estimateforDoubleDualTandemWheelAircraftWeightBearingCapacity
      ),
      estimateforDualTandemWheelAircraftWeightBearingCapacity: Utilities.getNumberOrNullValue(
        this.estimateforDualTandemWheelAircraftWeightBearingCapacity
      ),
      estimateforDualWheelAircraftWeightBearingCapacity: Utilities.getNumberOrNullValue(
        this.estimateforDualWheelAircraftWeightBearingCapacity
      ),
      estimateforSingleWheelAircraftWeightBearingCapacity: Utilities.getNumberOrNullValue(
        this.estimateforSingleWheelAircraftWeightBearingCapacity
      ),
      endDisplacedThreshold: Utilities.getNumberOrNullValue(this.endDisplacedThreshold),
      edgeLights: Utilities.getNumberOrNullValue(this.edgeLights),
      endLights: Boolean(this.endLights),
      obstructions: this.obstructions,
      runwayApproachLightId: this.runwayApproachLight.id,
      runwayVGSIId: this.runwayVGSI.id,
      runwayTypeId: this.runwayTypeId,
      runwayApproachTypeIds: this.appliedRunwayApproachTypes?.map(a => a.id) || [],
      runwayRVRIds: this.appliedRunwayRVRs?.map(a => a.id) || [],
      runwayNavaidIds: this.appliedRunwayNavaids?.map(a => a.id) || [],
    };
  }

  public static deserializeList(operatingHoursList: IAPIRunwayDetail[]): RunwayDetailModel[] {
    return operatingHoursList
      ? operatingHoursList.map((operatingHours: IAPIRunwayDetail) => RunwayDetailModel.deserialize(operatingHours))
      : [];
  }
}
