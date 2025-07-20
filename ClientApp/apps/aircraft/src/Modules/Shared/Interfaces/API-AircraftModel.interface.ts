import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAircraftModel extends IBaseApiResponse {
  modelId?: number;
  modelMakes?: IAPIModelMake[];
}

export interface IAPIModelMake extends IBaseApiResponse {
  make?: IAPIMake;
  isLargeAircraft: boolean;
  makeId?: number;
}

interface IAPIMake extends IBaseApiResponse {
  makeId: number;
}
