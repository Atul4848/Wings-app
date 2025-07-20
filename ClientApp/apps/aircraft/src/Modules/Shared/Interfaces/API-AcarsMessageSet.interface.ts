import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIAcarsSoftwareVersion } from './API-AcarsSoftwareVersion.interface';

export interface IAPIAcarsMessageSet extends IBaseApiResponse {
  acarsSoftwareVersion?: IAPIAcarsSoftwareVersion;
  acarsSoftwareVersionId: number;
}
