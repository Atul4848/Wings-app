import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIPermitLeadTime extends IBaseApiResponse {
  permitId: number;
  leadTimeValue: number;
  maxLeadTimeValue: number;
  timeLevelUOMId: number;
  flightOperationalCategoryId: number;
  leadTimeTypeId: number;
  farTypeId: number;
  // No sql Fields
  leadTimeId?: number;
  leadTimeType?: IAPILeadTimeType;
  timeLevelUOM?: ITimeLevelUOM;
  flightOperationalCategory?: IFlightOperationalCategory;
  farType?: IFARType;
}

export interface IAPILeadTimeType extends IBaseApiResponse {
  leadTimeTypeId: number;
}

interface ITimeLevelUOM extends IBaseApiResponse {
  timeLevelUOMId: number;
}

interface IFlightOperationalCategory extends IBaseApiResponse {
  flightOperationalCategoryId: number;
}

interface IFARType extends IBaseApiResponse {
  farTypeId: number;
}
