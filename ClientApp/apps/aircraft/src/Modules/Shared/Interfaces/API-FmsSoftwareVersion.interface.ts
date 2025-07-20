import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIFmsModel } from '.';

export interface IAPIFmsSoftwareVersion extends IBaseApiResponse {
  fmsModel?: IAPIFmsModel;
  fmsModelId: number;
}
