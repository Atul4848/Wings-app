import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPISalesRep extends IBaseApiResponse {
  email:string;
  firstName: string;
  lastName: string;
  salesRepId: number;
}
