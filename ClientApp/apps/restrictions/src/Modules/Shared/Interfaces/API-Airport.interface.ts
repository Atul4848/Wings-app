import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAirport extends IBaseApiResponse {
  airportId: number;
  icao: string;
  code: string;
}
