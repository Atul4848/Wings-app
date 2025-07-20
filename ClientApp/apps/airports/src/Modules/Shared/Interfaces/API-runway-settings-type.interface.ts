import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIRunwaySettingsType extends IBaseApiResponse {
  code: string;
  description: string;
}

export interface IAPIRunwaySurfaceType extends IAPIRunwaySettingsType {
  runwaySurfaceTypeId?: number;
  isHardSurface: boolean;
}

export interface IAPIRunwayCondition extends IAPIRunwaySettingsType {
  runwayConditionId?: number;
}

export interface IAPIRunwaySurfaceTreatment extends IAPIRunwaySettingsType {
  runwaySurfaceTreatmentId?: number;
}

export interface IAPIRunwayLightType extends IAPIRunwaySettingsType {
  runwayLightTypeId?: number;
  faaCode?: string;
}

export interface IAPIRunwayRVR extends IAPIRunwaySettingsType {
  runwayRVRId?: number;
}

export interface IAPIRunwayApproachLight extends IAPIRunwaySettingsType {
  runwayApproachLightId?: number;
}

export interface IAPIRunwayVGSI extends IAPIRunwaySettingsType {
  runwayVGSIId?: number;
}

export interface IAPIRunwayNavaids extends IAPIRunwaySettingsType {
  runwayNavaidId?: number;
}

export interface IAPIRunwayApproachTypeId extends IAPIRunwaySettingsType {
  runwayApproachTypeId?: number;
}

export interface IAPIRunwayUsageType extends IBaseApiResponse {
  runwayUsageTypeId?: number;
}
