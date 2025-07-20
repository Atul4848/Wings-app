import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPICAPPSTerritoryType extends IBaseApiResponse {
  territoryTypeId?: number;
  cappsTerritoryTypeId?: number;
  code: string;
}
