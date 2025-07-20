import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIEtpFinalDescentBurn extends IBaseApiResponse {
  time: number;
  burn: number;
  distance: number;
  etpFinalDescentBurnMethodId: number;
  etpFinalDescentBurnMethod?: IAPIEtpFinalDescentBurnMethod;
}

interface IAPIEtpFinalDescentBurnMethod extends IBaseApiResponse {
  etpFinalDescentBurnMethodId: number;
}
