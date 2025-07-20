import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIExternalCustomerMapping extends IBaseApiResponse {
  externalCustomerMappingId?: number;
  externalApiKey: string;
  externalAccountId: string;
  externalCustomerMappingLevelId: number;
  externalCustomerMappingLevel?: IMappingLevel;
  externalCustomerSourceId: number;
  externalCustomerSource?: IExternalCustomerSource;
  partyId: number;
  customerName: string;
  customerNumber: string;
  customerStartDate?: string;
  customerEndDate?: string;
  customer?: ICustomer;
  customerAssociatedRegistryIds: number[];
  customerAssociatedRegistries?: IAPIRegistry[];

  customerAssociatedOfficeIds: number[];
  customerAssociatedOffices?: IAPIOffice[];

  customerAssociatedOperatorIds: number[];
  customerAssociatedOperators?: IAPIOperator[];
}

interface IMappingLevel extends IBaseApiResponse {
  externalCustomerMappingLevelId?: number;
}

interface IExternalCustomerSource extends IBaseApiResponse {
  externalCustomerSourceId?: number;
}

interface ICustomer extends IBaseApiResponse {
  customerId?: number;
  number: string;
  partyId: number;
}

interface IAPIOffice extends IBaseApiResponse {
  customerAssociatedOfficeId: number;
  associatedOfficeId: number;
  associatedOfficeName: string;
  associatedOfficeCode: string;
}

interface IAPIOperator extends IBaseApiResponse {
  customerAssociatedOperatorId: number;
  operator: IOperator;
}

interface IOperator {
  operatorId: number;
  id: number;
  name: string;
}

interface IAPIRegistry extends IBaseApiResponse {
  customerAssociatedRegistryId: number;
  registry: IRegistry;
}

interface IRegistry {
  registryId: number;
  id: number;
  name: string;
}
