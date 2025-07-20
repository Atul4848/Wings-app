import { IBaseApiResponse } from '@wings-shared/core';
import { IAPICountry, IAPIRegion, IAPIState } from '@wings/shared';

export interface IAPIAssociatedRegion extends IBaseApiResponse {
  region: IAPIRegion;
  country: IAPICountry;
  state: IAPIState;
}

export interface IAPIAssociatedRegionRequest extends IBaseApiResponse {
  regionId: number;
  countryId: number;
  stateId?: number;
}
