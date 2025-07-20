import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPICruiseEtpProfile extends IBaseApiResponse {
  maxFlightLevel: number;
  maxFlightLevelIncrement: number;
  maxFlightLevelIncrementLimit: number;
  speed: string;
  additionalMaxFlightLevel1: number;
  additionalTime2: number;
  additionalMaxFlightLevel2: number;
  additionalTime1: number;
  etpCruiseId: number;
  etpCruise?: IAPIEtpCruise;
}

interface IAPIEtpCruise extends IBaseApiResponse {
  etpCruiseId: number;
}
