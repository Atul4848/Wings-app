import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIFlightPlanChangeRecords extends IBaseApiResponse {
  flightPlanFormat: IFlightPlanFormat;
  requestedBy: string;
  changedBy: string;
  changedDate: string;
  notes: string;
}

interface IFlightPlanFormat {
  flightPlanFormatId: number;
  format: string;
}
