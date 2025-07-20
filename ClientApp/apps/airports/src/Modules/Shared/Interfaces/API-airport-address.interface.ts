import { IBaseApiResponse } from '@wings-shared/core';
import { IAPICity, IAPICountry, IAPIState } from '@wings/shared';

export interface IAPIAirportAddress extends IBaseApiResponse {
  addressId?: number;
  addressLine1: string;
  addressLine2: string;
  city?: IAPICity;
  state?: IAPIState;
  country?: IAPICountry;
  countryId: number;
  countryCode: string;
  countryName: string;
  stateId: number;
  stateCode: string;
  stateName: string;
  cityId: number;
  cityCode: string;
  cityName: string;
  cityCAPPSName: string;
  zipCode: string;
  email: string;
  phone: string;
}
