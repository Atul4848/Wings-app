import { IBaseApiResponse } from '@wings-shared/core';

export interface ICustomsDecalRequest extends IBaseApiResponse {
  customsDecalNumber: number | null;
  year: number;
  registryId: number;
  noteTypeId: number | null;
}
