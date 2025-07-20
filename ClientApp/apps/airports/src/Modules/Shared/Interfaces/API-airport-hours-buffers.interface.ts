import { IBaseApiResponse } from '@wings-shared/core';
export interface IAPIAirportHoursBuffer extends IBaseApiResponse {
  buffer?: number;
  airportHoursBufferSubType?: IAPIAirportHoursBufferSubType;
  airportHoursType?: IAPIAirportHoursType;
  airportHoursTypeId?: number;
  airportHoursBufferSubTypeId?: number;
  airportHoursBufferId: number;
}

export interface IAPIAirportHoursBufferSubType extends IBaseApiResponse {
  airportHoursBufferSubTypeId?: number;
}

export interface IAPIAirportHoursType extends IBaseApiResponse {
  airportHoursTypeId?: number;
}