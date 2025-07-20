import { IBaseApiResponse } from '@wings-shared/core';
import { IAPICountry } from './API-country.interface';
import { IAPIState } from './API-state.interface';

export interface IAPIIsland extends IBaseApiResponse {
  islandId?: number;
  country?: IAPICountry;
  countryId: number;
  countryCode?: string;
  countryName?: string;
  stateId: number;
  stateCode?: string;
  stateName?: string;
  state?: IAPIState;
}
