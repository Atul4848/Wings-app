import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIEtpApuBurn extends IBaseApiResponse {
  time: number;
  burn: number;
  etpapuBurnMethodId: number;
  etpapuBurnMethod?: IAPIEtpApuBurnMethod;
}

interface IAPIEtpApuBurnMethod extends IBaseApiResponse {
  etpapuBurnMethodId: number;
}
