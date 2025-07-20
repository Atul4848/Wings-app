import { IBaseApiResponse } from '@wings-shared/core';

interface IAPIManufacturer extends IBaseApiResponse {
  fmsManufacturerReferenceId: number;
}

export interface IAPIFmsModel extends IBaseApiResponse {
  fmsManufacturer?: IAPIManufacturer;
  fmsManufacturerId: number;
  fmsModelId? : number;
}
