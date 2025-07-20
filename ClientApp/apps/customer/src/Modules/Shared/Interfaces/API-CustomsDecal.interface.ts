import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIRegistryRef } from '@wings/shared';

export interface IAPICustomsDecal extends IBaseApiResponse {
  customsDecalNumber: number;
  year: number;
  noteType: IAPINoteType;
  registry: IAPIRegistryRef;
}

export interface IAPINoteType {
  noteTypeId: number;
  name: string;
}
