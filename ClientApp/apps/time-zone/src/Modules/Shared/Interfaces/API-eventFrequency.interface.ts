import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIEventFrequency extends IBaseApiResponse {
  frequencyType: string;
  description: string;
}
