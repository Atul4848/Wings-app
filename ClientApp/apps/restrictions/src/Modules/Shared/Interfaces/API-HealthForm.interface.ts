import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIHealthForm extends IBaseApiResponse {
  healthFormId?: number;
}
