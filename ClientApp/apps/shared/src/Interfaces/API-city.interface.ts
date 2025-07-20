import { IBaseApiResponse } from '@wings-shared/core';
import { IAPICountry, IAPIMetro, IAPIState, IAPICityAlternateNames } from '../Interfaces';

export interface IAPICity extends IAPICityRequest {
  cityId?: number;
  cityName?: string;
  code?: string;
  country?: IAPICountry;
  state?: IAPIState;
  metro?: IAPIMetro;
}

export interface IAPICityRequest extends IBaseApiResponse {
  countryId: number;
  stateId: number;
  officialName: string;
  commonName: string;
  metroId: number;
  cappsCode: string;
  cappsName: string;
  cappsShortName: string;
  cappsStateCode: string;
  latitude: number;
  longitude: number;
  population: number;
  ranking: number;
  simpleCityID: number;
  alternateNames: IAPICityAlternateNames[];
}
