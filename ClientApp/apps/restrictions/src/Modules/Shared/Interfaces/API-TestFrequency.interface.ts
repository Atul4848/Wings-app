import { IBaseApiResponse } from '@wings-shared/core';

export interface ITestFrequency extends IBaseApiResponse {
  testFrequencyId?: number;
  interval: number;
}
