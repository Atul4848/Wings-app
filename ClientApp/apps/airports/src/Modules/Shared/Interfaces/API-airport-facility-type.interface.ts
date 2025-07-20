import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAirportFacility extends IBaseApiResponse {
  airportFacilityTypeId?: number;
}

export interface IAPIAirportUsage extends IBaseApiResponse {
  airportUsageTypeId?: number;
}

export interface IAPIAirportType extends IBaseApiResponse {
  airportTypeId?: number;
}

export interface IAPIDistanceUOM extends IBaseApiResponse {
  distanceUOMId?: number;
}

export interface IAPIAirportDirection extends IBaseApiResponse {
  airportDirectionId?: number;
}

export interface IAPIAirportFacilityAccessLevel extends IBaseApiResponse {
  airportFacilityAccessLevelId?: number;
}

export interface IAPIICAOCode extends IBaseApiResponse {
  code: string;
  icaoCodeId?: number;
}

export interface IAPIMilitaryUseType extends IBaseApiResponse {
  code: string;
  militaryUseTypeId?: number; //required in mongoDb only
}

export interface IAPIAirportDataSource extends IBaseApiResponse {
  airportDataSourceId?: number;
}

export interface IAPIFrequencyType extends IBaseApiResponse {
  frequencyTypeId?: number;
}

export interface IAPISector extends IBaseApiResponse {
  sectorId?: number;
}
