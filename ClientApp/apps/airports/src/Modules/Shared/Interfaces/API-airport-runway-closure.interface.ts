import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAirportRunwayClosure extends IBaseApiResponse {
  runwayId: number;
  runwayName: string;
  notamId: string;
  closureStartDate: string;
  closureEndDate: string;
  closureStartTime: string;
  closureEndTime: string;
  airportId: number;
  runwayClosuresId: number;
}

export interface IAPIRunwayClosure extends IBaseApiResponse {
  runwayId: number;
  runwayName: string;
  notamId: string;
  closureStartDate: string;
  closureEndDate: string;
  closureStartTime: string;
  closureEndTime: string;
  airportId: number;
  runwayClosuresId: number;
}


export interface IAPIAirportRunwayClosures extends IBaseApiResponse {
  runwayId: number;
  runwayName: string;
  runwayClosures:IAPIRunwayClosure[];
  airportId: number;
  runwayClosuresId: number;
}