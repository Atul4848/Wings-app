import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAcarsModel extends IBaseApiResponse {
  acarsManufacturer?: IAPIManufacturer;
  acarsManufacturerId: number;
  acarsModelId?: number;
}

export interface IAPIManufacturer extends IBaseApiResponse {
  acarsManufacturerReferenceId: number;
}
