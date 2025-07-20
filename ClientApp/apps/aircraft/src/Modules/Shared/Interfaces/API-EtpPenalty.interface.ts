import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIEtpPenalty extends IBaseApiResponse {
  biasFields: number;
  etpPenaltyCategoryId: number;
  etpPenaltyApplyToId: number
  etpPenaltyBiasTypeId : number;
  etpPenaltyBiasType? : IAPIEtpPenaltyBiasType
  etpPenaltyApplyTo?: IAPIEtpPenaltyApplyTo;
  etpPenaltyCategory?: IAPIEtpPenaltyCategory;
}

interface IAPIEtpPenaltyBiasType extends IBaseApiResponse {
  etpPenaltyBiasTypeId: number; 
}

interface IAPIEtpPenaltyApplyTo extends IBaseApiResponse {
  etpPenaltyApplyToId: number;
}

interface IAPIEtpPenaltyCategory extends IBaseApiResponse {
  etpPenaltyCategoryId: number;
  
}
