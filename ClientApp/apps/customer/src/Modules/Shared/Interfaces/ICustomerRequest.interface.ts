import { IBaseApiResponse } from '@wings-shared/core';

export interface ICustomerRequest extends IBaseApiResponse {
  number: string;
}
