import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIPermitInfoReview extends IBaseApiResponse {
  country: IAPICountry;
  permitType?: IAPIPermitType;
  mergeStatus?: number;
  comparisionType?: number;
  vendorPermitId?:number;
  permitUplinkStagingProperties?: IAPIUplinkPermitInfoReview[];
}

interface IAPICountry extends IBaseApiResponse {
  countryId: number;
  countryCode: string
  countryName: string
}

interface IAPIPermitType extends IBaseApiResponse {
  permitTypeId: number;
}

export interface IAPIUplinkPermitInfoReview {
  id: number;
  permitStagingPropertyId: number;
  tableName: string;
  propertyName: string;
  oldValue?: string;
  newValueId?: number | null;
  newValueCode?: string;
  newValue?: string;
  mergeStatus: number;
  isList?: boolean;
}
