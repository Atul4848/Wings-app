import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIOperator } from './API-operator.interface';
import { IAPICustomerRef } from '@wings/shared';

export interface IAPIAssociatedOperators extends IBaseApiResponse {
  associatedOperatorId?: number;
  startDate: string;
  endDate: string;
  operator: IAPIOperator;
  customer: IAPICustomerRef;
}
