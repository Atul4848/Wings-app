import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPICustomerRef extends IBaseApiResponse {
  customerId?: number;
  number: string;
  partyId: number;
  startDate?: string;
  endDate?: string;
}
