import { IBaseApiResponse } from '@wings-shared/core';
import {
  IAPIRunwayApproachLight,
  IAPIRunwayApproachTypeId,
  IAPIRunwayNavaids,
  IAPIRunwayRVR,
  IAPIRunwayVGSI,
} from './API-runway-settings-type.interface';

export interface IAPIRunwayDetail extends IBaseApiResponse {
  runwayDetailId: number;
  runwayId: number;
  runwayType?: IAPIRunwayType;
  runwayNumber: string;
  visualGlideAngle: number;
  rvv: boolean;
  reil: boolean;
  centerlineLights: boolean;
  touchdownLights: boolean;
  pcn: string;
  weightBearingCapSingleWheel: number;
  weightBearingCapDualWheel: number;
  weightBearingCapDualTandem: number;
  weightBearingCapDoubleDualTandem: number;
  takeOffRunAvailableTORA: number;
  takeOffDistanceAvailableTODA: number;
  accelerateStopDistanceAvailableASDA: number;
  landingDistanceAvailableLDA: number;
  estimateforDoubleDualTandemWheelAircraftWeightBearingCapacity: number;
  estimateforDualTandemWheelAircraftWeightBearingCapacity: number;
  estimateforDualWheelAircraftWeightBearingCapacity: number;
  estimateforSingleWheelAircraftWeightBearingCapacity: number;
  endDisplacedThreshold: number;
  edgeLights: number;
  endLights: boolean;
  obstructions: string;
  runwayApproachLightId: Number;
  runwayVGSIId: Number;
  runwayTypeId: number;
  runwayApproachTypeIds: number[];
  runwayRVRIds: number[];
  runwayNavaidIds: number[];
  runwayApproachLight?: IAPIRunwayApproachLight;
  runwayVGSI?: IAPIRunwayVGSI;
  appliedRunwayApproachTypes?: IAPIAppliedRunwayApproachTypes[];
  appliedRunwayRVRs?: IAPIAppliedRunwayRVRs[];
  appliedRunwayNavaids?: IAPIAppliedRunwayNavaids[];
}

interface IAPIAppliedRunwayApproachTypes {
  runwayApproachType: IAPIRunwayApproachTypeId;
}
interface IAPIAppliedRunwayRVRs {
  runwayRVR: IAPIRunwayRVR;
}
interface IAPIAppliedRunwayNavaids {
  runwayNavaid: IAPIRunwayNavaids;
}

interface IAPIRunwayType extends IBaseApiResponse {
  runwayTypeId: number;
}
