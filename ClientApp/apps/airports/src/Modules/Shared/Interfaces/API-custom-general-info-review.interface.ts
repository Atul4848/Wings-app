import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPICustomGeneralInfoReview extends IBaseApiResponse {
  airport: IAPIAirport;
  mergeStatus?: number;
  comparisionType?: number;
  vendorCustomGeneralInfoId?:number;
  customGeneralInfoUplinkStagingProperties?: IAPIUplinkCustomGeneralInfoReview[];
}

interface IAPIAirport extends IBaseApiResponse {
  airportId: number;
  code: string
}

export interface IAPIUplinkCustomGeneralInfoReview {
  id: number;
  customGeneralInfoUplinkStagingId: number;
  tableName: string;
  propertyName: string;
  oldValue?: string;
  newValueId?: number | null;
  newValueCode?: string;
  newValue?: string;
  mergeStatus: number;
  isList?: boolean;
}
