import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIRegistry extends IBaseApiResponse {
  name: string;
  registryId: number;
}
