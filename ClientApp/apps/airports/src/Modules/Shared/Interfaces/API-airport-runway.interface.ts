import {
  IAPIRunwayCondition,
  IAPIRunwayLightType,
  IAPIRunwaySurfaceTreatment,
  IAPIRunwaySurfaceType,
  IAPIRunwayUsageType,
} from './API-runway-settings-type.interface';

import { IAPIRunwayDetail } from './API-airport-runway-detail.interface';
import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAirportRunway extends IBaseApiResponse {
  runwayId?: number;
  runway_Id: string;
  length: number;
  width: number;
  airportId: number;
  elevation: number;
  centerLineSpacing: number;
  statusDate: string;
  runwaySurfaceTreatment?: IAPIRunwaySurfaceTreatment;
  runwaySurfacePrimaryType?: IAPIRunwaySurfaceType;
  runwaySurfaceSecondaryType?: IAPIRunwaySurfaceType;
  runwayLightType?: IAPIRunwayLightType;
  runwayCondition?: IAPIRunwayCondition;
  runwayUsageType?: IAPIRunwayUsageType;
  runwaySurfaceTreatmentId: number;
  runwayConditionId: number;
  runwayUsageTypeId: number;
  runwaySurfacePrimaryTypeId: number;
  runwaySurfaceSecondaryTypeId: number;
  runwayLightTypeId: number;
  runwayDetail: IAPIRunwayDetail[];
}
