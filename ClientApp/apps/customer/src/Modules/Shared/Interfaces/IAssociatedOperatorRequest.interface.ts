import { IBaseApiResponse } from '@wings-shared/core';

export interface IAssociatedOperatorRequest extends IBaseApiResponse {
  startDate: string | null;
  endDate: string | null;
  customerStartDate?: string;
  customerEndDate?: string;
  operatorId: number;
  partyId: number;
  customerName: string;
  customerNumber: string;
}
