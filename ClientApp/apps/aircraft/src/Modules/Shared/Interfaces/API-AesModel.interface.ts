import { IBaseApiResponse } from '@wings-shared/core';

interface IAPAesManufacturer extends IBaseApiResponse {
    aesManufacturerId: number;
}

export interface IAPIAesModel extends IBaseApiResponse {
  aesManufacturer?: IAPAesManufacturer;
  aesManufacturerId: number;
}
