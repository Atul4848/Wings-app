import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIFuelReservePolicy extends IBaseApiResponse {
  policyNumber: number;
  policyDescription: string;
}
