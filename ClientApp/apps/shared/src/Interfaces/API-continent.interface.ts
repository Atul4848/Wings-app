import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIContinent extends IBaseApiResponse {
  continentId?: number;
  code: string;
}
