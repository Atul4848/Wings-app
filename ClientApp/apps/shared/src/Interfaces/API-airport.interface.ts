import { IBaseApiResponse, IAPIIdNameCode } from '@wings-shared/core';

export interface IAPIAirport extends IBaseApiResponse {
  airportId: number;
  airportName: string;
  airportCode?: string;
  commonName: string;
  icaoCode: IAPIIdNameCode;
  uwaCode: string;
  displayCode: string;
  // Coming in UVGO airports collection
  icao: string;
  faaCode: string;
  regionalCode: string;
}
