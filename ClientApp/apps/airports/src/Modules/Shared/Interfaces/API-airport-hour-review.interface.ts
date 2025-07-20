import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAirportHourReview extends IBaseApiResponse {
  cappsSequenceId?: number;
  airportHoursType?: IAPIAirportHourType;
  airport: IAPIAirport;
  mergeStatus?: number;
  comparisionType?: number;
  airportHourStagingId?:number;
  uplinkStagingProperties?: IAPIUplinkAirportHourReview[];
}

interface IAPIAirport extends IBaseApiResponse {
  airportId: number;
  code: string
}
interface IAPIAirportHourType extends IBaseApiResponse {
  airportHoursTypeId: number;
}

export interface IAPIUplinkAirportHourReview {
  id: number;
  airportHourUplinkStagingId: number;
  tableName: string;
  propertyName: string;
  oldValue?: string;
  newValueId?: number | null;
  newValueCode?: string;
  newValue?: string;
  mergeStatus: number;
  isList?: boolean;
}
