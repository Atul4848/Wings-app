import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIState, IAPICity, IAPICountry, IAPIIsland } from '@wings/shared';

export interface IAPIAirportLocation extends IAPIAirportLocationRequest {
  airportLocationId: number;
  city: IAPICity;
  state: IAPIState;
  country: IAPICountry;
  closestCity: IAPICity;
  island: IAPIIsland;
}

export interface IAPIAirportLocationRequest extends IBaseApiResponse {
  airportId?: number;
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
  closestCityId: number;
  closestCityCode: string;
  closestCityName: string;
  islandId: number;
  islandCode: string;
  islandName: string;
  magneticVariation: string;
  elevation: IAPIElevation;
  distanceToDowntown: IAPIDistanceToDowntown;
}

interface IdValueLocation {
  id: number;
  value: number;
  airportLocationId: number;
}

interface IAPIElevation extends IdValueLocation {
  elevationId?: number;
  elevationUOMId: number;
  elevationUOM?: IAPIDistanceUOM;
}

interface IAPIDistanceToDowntown extends IdValueLocation {
  distanceUOMId: number;
  airportDirectionId: number;
  airportDirection?: IAPIAirportDirection;
  distanceUOM?: IAPIDistanceUOM;
  distanceToDowntownId?: number;
}

interface IAPIDistanceUOM extends IBaseApiResponse {
  distanceUOMId: number;
}

interface IAPIAirportDirection extends IBaseApiResponse {
  airportDirectionId: number;
}
