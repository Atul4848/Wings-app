import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPICityAlternateNames extends IBaseApiResponse {
  cityId: number;
  alternateName: string;
  cityAlternateNameId?: number;
}
