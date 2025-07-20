import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIFIR extends IBaseApiResponse {
  firId: number;
  code: string;
  permitAppliedFIRId?: number;
}

export interface IAPIFIRRequest extends IBaseApiResponse {
  firId: number;
  code: string;
}
