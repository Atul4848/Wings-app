import { IBaseApiResponse } from '@wings-shared/core';
import { IAPITimeZoneRegion } from './API-time-zone.interface';

export interface IAPIAirportTimeZoneMapping extends IBaseApiResponse {
    airportId: number;
    airportCode: string;
    airportName?:string
    timezoneRegionId:number
    timezoneRegionName?:string
    timezoneRegion?: IAPITimeZoneRegion;
    timezoneName:string
  }