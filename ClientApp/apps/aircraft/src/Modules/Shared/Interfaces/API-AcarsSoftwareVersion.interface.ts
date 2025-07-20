import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIAcarsModel } from '.';

export interface IAPIAcarsSoftwareVersion extends IBaseApiResponse {
  acarsModel?: IAPIAcarsModel;
  acarsModelId: number;
  acarsSoftwareVersionId?: number;
}
