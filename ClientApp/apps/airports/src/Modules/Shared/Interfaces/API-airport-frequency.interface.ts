import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAirportFrequency extends IBaseApiResponse {
  airportId?: number;
  airportFrequencyId?: number;
  frequency: string;
  phone: number;
  sectorId: number;
  frequencyTypeId: number;
  sector?: IAPISector;
  frequencyType?: IAPIFrequencyType;
  airportFrequencyRunways?: IAPIFrequencyRunway[];
  comments: string;
  faaComments: string;
}

interface IAPISector extends IBaseApiResponse {
  sectorId: number;
}

interface IAPIFrequencyType extends IBaseApiResponse {
  frequencyTypeId: number;
}

export interface IAPIFrequencyRunway extends IBaseApiResponse {
  airportFrequencyId: number;
  runwayDetailId: number;
  runwayId?: number;
  runwayNumber?: string;
}
