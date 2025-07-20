import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIRegistryIdentifierCountry extends IBaseApiResponse {
  identifier: string;
  countryId: number;
  countryCode: string;
}
