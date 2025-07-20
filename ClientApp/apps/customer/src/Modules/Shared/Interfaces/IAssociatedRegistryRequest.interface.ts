import { IBaseApiResponse } from '@wings-shared/core';

export interface IAssociatedRegistryRequest extends IBaseApiResponse {
  startDate: string | null;
  endDate: string | null;
  customerStartDate?: string;
  customerEndDate?: string;
  registryId: number;
  partyId: number;
  customerName: string;
  customerNumber: string;
  teamId: number | null;
  associatedOfficeId: number | null;
  associatedRegistryServiceTypes: IAssociatedRegistryServiceTypeRequest[];
}

export interface IAssociatedRegistryServiceTypeRequest {
  id: number;
  serviceTypeId: number | string;
}
