import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPISovereignCountry extends IBaseApiResponse {
  countryId: number;
  officialName?: string;
  isO2Code?: string;
  code?: string;
}
