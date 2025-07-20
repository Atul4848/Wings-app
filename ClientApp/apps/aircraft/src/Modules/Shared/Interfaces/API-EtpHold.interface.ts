import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIEtpHold extends IBaseApiResponse {
  time: number;
  flightLevel: number;
  burn: number;
  etpHoldMethodId: number;
  etpHoldMethod?: IAPIEtpHoldMethod;
}

interface IAPIEtpHoldMethod extends IBaseApiResponse {
  etpHoldMethodId: number;
}
