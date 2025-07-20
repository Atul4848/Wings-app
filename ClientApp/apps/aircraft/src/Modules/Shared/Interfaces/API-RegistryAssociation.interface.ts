import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIRegistryAssociationDetail } from './API-RegistryAssociationDetail.interface';

export interface IAPIRegistryAssociation extends IBaseApiResponse {
  registry: string;
  customersWithNonStandardRunwayAnalysisRegistryId?: number;
  customersWithNonStandardRunwayAnalysisId?: number;
  customersWithNonStandardRunwayAnalysisRegistryOption?: IAPIRegistryAssociationDetail;
}
