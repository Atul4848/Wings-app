import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIWorldAware extends IBaseApiResponse {
  refreshFrequency: string;
  lastRefreshDate: string;
}
