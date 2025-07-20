import { IBaseApiResponse } from '@wings-shared/core';
import { IAPICustomer } from './API-customer.interface';

export interface IAPIRegistry extends IBaseApiResponse {
  name: string;
  registryId: number;
  associatedCustomers?: IAPICustomer[];
}
