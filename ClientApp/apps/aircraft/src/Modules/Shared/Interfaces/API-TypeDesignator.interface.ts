import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPITypeDesignator extends IBaseApiResponse {
  icaoTypeDesignatorId?: number;
  propulsionType?: IAPIPropulsionType;
  propulsionTypeId?: number;
}

export interface IAPIPropulsionType extends IBaseApiResponse {
  propulsionTypeId: number;
}
