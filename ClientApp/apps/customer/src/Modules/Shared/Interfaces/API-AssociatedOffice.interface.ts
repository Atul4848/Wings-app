import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIRegistry } from './API-registry.interface';
import { IAPIAirport, IAPICustomerRef } from '@wings/shared';

export interface IAPIAssociatedOffice extends IBaseApiResponse {
  officeId: number;
  code: string;
  startDate: string;
  endDate: string;
  airportId: number;
  airportName: string;
  airportCode: string;
  airport: IAPIAirport;
  customer: IAPICustomerRef;
  customerAssociatedRegistries: IAPICustomerAssociatedRegistries[];

  // API response
  associatedOfficeId: number;
  associatedOfficeName: string;
  associatedOfficeCode: string;
}

export interface IAPICustomerAssociatedRegistries {
  customerAssociatedRegistryId: number;
  registry: IAPIRegistry;
}
