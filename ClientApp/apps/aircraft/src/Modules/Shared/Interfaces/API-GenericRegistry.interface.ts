import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIGenericRegistry extends IBaseApiResponse {
  navBlueGenericRegistryId?: number;
  weightUOM?: IAPIWeightUOM;
  weightUOMId: number;
  rampWeight: number;
  mtow: number;
  zeroFuelWeight: number;
  maxLandingWeight: number;
  tankCapacity: number;
  bow: number;
  restrictExternalUse: boolean;
  performance?: IAPIPerformance;
}

interface IAPIWeightUOM extends IBaseApiResponse {
  weightUOMId?: number;
}

interface IAPIPerformance extends IBaseApiResponse {
  performanceId?: number;
}
