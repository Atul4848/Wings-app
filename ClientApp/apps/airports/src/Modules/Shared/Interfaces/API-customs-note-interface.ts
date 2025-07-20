import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPICustomsNote extends IBaseApiResponse {
  customsDetailId: number;
  noteId?: number;
  notes: string;
  noteTypeId: number;
  noteType?: IAPINoteType;
  typeCode: string;
  startDate?: string;
  endDate?: string;
}

export interface IAPINoteType extends IBaseApiResponse {
  noteTypeId?: number;
  cappsCode?: string;
}
