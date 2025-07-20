import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPICabotageReview extends IBaseApiResponse {
  country: IAPIAirport;
  mergeStatus?: number;
  comparisionType?: number;
  vendorCustomGeneralInfoId?:number;
  cabotageOperationalRequirementStagingProperties?: IAPIUplinkCabotageOperationalRequirementReview[];
}

interface IAPIAirport extends IBaseApiResponse {
  countryId: number;
  code: string
}

export interface IAPIUplinkCabotageOperationalRequirementReview {
  id: number;
  cabotageOperationalRequirementStagingId: number;
  tableName: string;
  propertyName: string;
  oldValue?: string;
  newValueId?: number | null;
  newValueCode?: string;
  newValue?: string;
  mergeStatus: number;
  isList?: boolean;
}
