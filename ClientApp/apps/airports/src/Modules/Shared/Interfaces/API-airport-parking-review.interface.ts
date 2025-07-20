import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAirportParkingReview extends IBaseApiResponse {
  airport: IAPIAirport;
  mergeStatus?: number;
  comparisionType?: number;
  vendorAirportParkingId?:number;
  airportParkingUplinkStagingProperties?: IAPIUplinkAirportParkingReview[];
}

interface IAPIAirport extends IBaseApiResponse {
  airportId: number;
  code: string
}

export interface IAPIUplinkAirportParkingReview {
  id: number;
  airportParkingStagingPropertyId: number;
  tableName: string;
  propertyName: string;
  oldValue?: string;
  newValueId?: number | null;
  newValueCode?: string;
  newValue?: string;
  mergeStatus: number;
  isList?: boolean;
}
