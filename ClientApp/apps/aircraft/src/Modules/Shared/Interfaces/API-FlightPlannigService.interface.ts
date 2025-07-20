import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIRegistryAssociation } from './API-RegistryAssociation.interface';

export interface IAPIFlightPlanningService extends IBaseApiResponse {
  customersWithNonStandardRunwayAnalysisId?: number;
  customerNumber: string;
  customerName: string;
  customersWithNonStandardRunwayAnalysisRegistries?: IAPIRegistryAssociation[];
}

export interface IAPICustomers {
  customerNumber: string;
  customerName: string;
}
