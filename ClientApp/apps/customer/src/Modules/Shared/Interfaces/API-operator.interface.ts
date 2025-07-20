import { IBaseApiResponse } from '@wings-shared/core';
import { IAPICustomer } from './API-customer.interface';

export interface IAPIOperator extends IBaseApiResponse {
  name: string;
  operatorId: number;
  associatedCustomers: IAPICustomer[];
}
