import { IBaseApiResponse } from '@wings-shared/core';
import { IAPICountry } from '@wings/shared';

export interface IAPIFIR extends IBaseApiResponse {
  firId: number;
  code: string;
  firControllingCountries: IAPICountry[];
  firLandmassCountries: IAPICountry[];
  appliedFeeRequirements?: IAPIAppliedFeeRequirements | null;
}

export interface IAPIAppliedFeeRequirements{
  feeRequirement: IAPIFeeRequirement;
}

export interface IAPIFeeRequirement extends IBaseApiResponse {
  feeRequirementId: number;
}

export interface IAPIFIRRequest extends IBaseApiResponse {
  code: string;
  controllingCountries: number[];
  landmassCountries: number[];
  appliedFeeRequirements?: IAPIAppliedFeeRequirements;
}
