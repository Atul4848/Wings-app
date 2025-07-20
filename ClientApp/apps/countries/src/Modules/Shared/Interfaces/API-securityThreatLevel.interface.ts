import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPISecurityThreatLevel extends IBaseApiResponse {
  refreshFrequency: string;
  lastRefreshDate: string;
}
