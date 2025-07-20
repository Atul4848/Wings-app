import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIAircraftModel } from './API-AircraftModel.interface';

export interface IAPISeries extends IBaseApiResponse {
  seriesId?: number;
  seriesModels?: IAPISeriesModel[];
  modelIds: number[];
}

interface IAPISeriesModel {
  model: IAPIAircraftModel;
}
