import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIICAOCode } from './API-airport-facility-type.interface';
import { IAPIAirportFlightPlanInfo } from './API-airport-flightplan-info.interface';
import { IAPICodeSettings } from './API-airport.interface';

export interface IAPIAirportMappings {
  Active: boolean;
  TotalRows: number;
  Icao: string;
  ApgCode: string;
  NavblueCode: string;
  Id: number;
}

export interface IAPIAirportMappingsBeta extends IBaseApiResponse {
  _id?: number;
  airportId?: number;
  icaoCode: IAPIICAOCode;
  faaCode: string;
  airportFlightPlanInfo: IAPIAirportFlightPlanInfo;
  uwaAirportCode?: IAPICodeSettings;
  regionalAirportCode?: IAPICodeSettings;
  uwaAirportCodeId?: number;
  regionalAirportCodeId?: number;
}
