import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIEtpMissedApproach extends IBaseApiResponse {
  time: number;
  distance: number;
  burn: number;
}
