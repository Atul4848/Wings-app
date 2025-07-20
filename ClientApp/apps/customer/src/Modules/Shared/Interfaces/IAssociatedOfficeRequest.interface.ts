import { IBaseApiResponse } from '@wings-shared/core';

export interface IAssociatedOfficeRequest extends IBaseApiResponse {
  code: string;
  startDate: string | null;
  endDate: string | null;
  customerStartDate?: string;
  customerEndDate?: string;
  airportId: number | null;
  airportName: string;
  airportCode: string;
  customerName: string;
  customerNumber: string;
  partyId: number;
  airport?: IAirportRequest;
  customerAssociatedRegistryIds: number[];
}

export interface IAirportRequest {
  airportId: number;
  airportName: string;
  airportCode: string;
}
