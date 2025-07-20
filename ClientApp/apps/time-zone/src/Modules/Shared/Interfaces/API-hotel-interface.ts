import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIHotel extends IBaseApiResponse {
  hotelId: number;
  externalId: string;
  hotelSource: string;
  addressLine1: string;
  addressLine2: string;
  city?: IAPICity;
  zipCode: string | null;
  state?: IAPIState;
  country?: IAPICountry;
  localPhoneNumber: string;
  faxNumber: string;
  reservationEmail: string;
  frontDeskEmail: string;
  website: string;
  airports: IAPIHotelAirport[];
  longitude: number;
  latitude: number;
}

export interface IAPIHotelRequest extends IBaseApiResponse {
  externalId: string;
  hotelSource: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string | null;
  localPhoneNumber: string;
  faxNumber: string;
  reservationEmail: string;
  frontDeskEmail: string;
  website: string;
  airports: IAPIAirportRequest[];
  cityId: number;
  cityName: string;
  cityCode: string;
  countryId: number;
  countryName: string;
  countryCode: string;
  stateId: number;
  stateName: string;
  stateCode: string;
  longitude: number;
  latitude: number;
}

export interface IAPIAirportRequest {
  id: number;
  airportId: number;
  distance: number;
  hotelId: number;
}

interface IAPICity {
  cityId: number;
  name: string;
  code: string;
}

interface IAPIState {
  stateId: number;
  name: string;
  code: string;
}

interface IAPICountry {
  countryId: number;
  name: string;
  code: string;
}

export interface IAPIHotelAirport {
  hotelAirportId: number;
  distance: number;
  airport: IAPIAirport;
}

interface IAPIAirport {
  airportId: number;
  name?: string;
  airportCode?: string;
  airportName?: string;
  displayCode?: string;
}
