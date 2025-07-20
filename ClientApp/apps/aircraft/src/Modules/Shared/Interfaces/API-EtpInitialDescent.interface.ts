import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIEtpInitialDescent extends IBaseApiResponse {
  normalProfile: string;
  icingProfile: string;
  fixedTime?: number;
  fixedBurn?: number;
  fixedDistance?: number;
  flightLevel: number;
  etpLevelOffId: number;
  etpMainDescentId: number;
  etpAltDescentId: number;
  etpLevelOff?: IAPIEtpLevelOff;
  etpMainDescent?: IAPIMainDescent;
  etpAltDescent?: IAPIaltDescent;
}

interface IAPIEtpLevelOff extends IBaseApiResponse {
  etpLevelOffId: number;
}

interface IAPIMainDescent extends IBaseApiResponse {
  etpMainDescentId: number;
}

interface IAPIaltDescent extends IBaseApiResponse {
  etpAltDescentId: number;
}
