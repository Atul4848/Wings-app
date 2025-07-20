import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIPermitApplied extends IBaseApiResponse {
  permitAppliedId?: number;
  extendedByNM: number;
  isPolygon: boolean;
  permitAppliedTo?: IAPIPermitAppliedTo;
  permitAppliedFIRs: IAPIFIR[];
  geoJson: string;
}

interface IAPIPermitAppliedTo extends IBaseApiResponse {
  permitAppliedToId: number;
}

interface IAPIFIR extends IBaseApiResponse {
  firId: number;
  code: string;
  permitAppliedFIRId?: number;
}

export interface IAPIPermitAppliedRequest extends IBaseApiResponse {
  extendedByNM?: number;
  isPolygon?: boolean;
  geoJson: string;
  permitId?: number;
  permitAppliedToId?: number;
  permitAppliedToName?: string;
  permitAppliedFIRs: IAPIFIR[];
}
