import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIFlightPlan extends IBaseApiResponse {
  startDate?: string;
  endDate?: string;
  format: string;
  builtBy: string;
  builtDate?: string;
  contactForChanges: string;
  description?: string;
  notes?: string;
  lastUsedDate?: string;
  flightPlanFormatId?: number;
  flightPlanFormatStatus?: IAPIFlightPlanFormatStatus;
  flightPlanFormatStatusId: number;
  flightPlanFormatAccounts: IAPIFlightPlanAccount[];
  flightPlanFormatChangeRecords: IAPIFlightPlanChangeRecord[];
  flightPlanFormatDocuments: IAPIFlightPlanDocument[];
}

interface IAPIFlightPlanFormatStatus {
  flightPlanFormatStatusId: number;
  name: string;
}

export interface IAPIFlightPlanAccount extends IBaseApiResponse {
  accountNumber: string;
  flightPlanFormatAccountRegistries: IAPIFlightPlanAccountRegistries[];
  flightPlanFormatAccountId?: number;
  flightPlanFormatAccountRegistryId?: number;
  includeEscapeRoutes: boolean;
}

export interface IAPIFlightPlanAccountRegistries extends IBaseApiResponse {
  flightPlanFormatAccountRegistryId?: number;
}

export interface IAPIFlightPlanChangeRecord extends IBaseApiResponse {
  requestedBy: string;
  changedBy: string;
  changedDate: string;
  notes: string;
  flightPlanFormatChangeRecordId?: number;
}

export interface IAPIFlightPlanDocument extends IBaseApiResponse {
  name: string; 
  link: string;
  flightPlanFormatDocumentId?: number;
}
