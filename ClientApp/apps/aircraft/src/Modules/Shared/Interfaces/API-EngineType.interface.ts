import { IBaseApiResponse } from '@wings-shared/core';
import { IAPISeries } from './API-Series.interface';

export interface IAPIEngineType extends IBaseApiResponse {
  engineTypeSeries?: IAPIEngineTypeSeries[];
  seriesIds: number[];
}

interface IAPIEngineTypeSeries {
  series: IAPISeries;
}
