import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAirportHoursSubTypes extends IBaseApiResponse {
  airportHoursTypeId: number;
  sequenceId: number;
  description: string;
  airportHoursSubTypeId?: number;
  airportHoursType?: IAPIAirportHoursType;
}

export interface IAPIAirportHoursType extends IBaseApiResponse {
  airportHoursTypeId?: number;
}
