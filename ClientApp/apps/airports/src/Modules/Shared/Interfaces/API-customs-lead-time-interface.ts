import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPICustomsLeadTime extends IBaseApiResponse {
  customsDetailId: number;
  customsLeadTimeId?: number;
  leadTime: number;
  preClearance: boolean;
  customsLeadTimeTypeId: number;
  customsLeadTimeType?: IAPILeadTimeType;
  flightOperationalCategory?: IFlightOperationalCategory;
  flightOperationalCategoryId: number;
  flightOperationalCategoryName: string;
}

export interface IAPILeadTimeType extends IBaseApiResponse {
  customsLeadTimeTypeId: number;
}

interface IFlightOperationalCategory extends IBaseApiResponse {
  flightOperationalCategoryId: number;
}
