import { IBaseApiResponse } from '@wings-shared/core';
import { IAPICountry, IAPIState, IAPICity } from './index';
export interface IAPIMetro extends IBaseApiResponse {
  cityId: number;
  stateId: number;
  stateName: string;
  stateCode: string;
  countryId: number;
  countryName: string;
  countryISO2Code: string;
  cityCode: string;
  cityName: string;
  country: IAPICountry;
  state: IAPIState;
  principalCity: IAPICity;
}

export interface IAPIMetroRequest extends IBaseApiResponse {
  code: string;
  countryId: number;
  stateId: number;
  principalCityId: number;
}
