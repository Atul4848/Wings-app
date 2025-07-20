import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPICabotage extends IBaseApiResponse {
  isCabotageEnforced: boolean;
  isImportationFeesforDomesticFlight: boolean;
  isCustomsStopsExempt: boolean;
  isPaxMustDepartwithSameOperator: boolean;
  isNoNewPaxAllowedtoDepart: boolean;
  isCabotageAppliestoLivestock: boolean;
  isCabotageAppliestoCargo: boolean;
  isCabotageAppliestoNonResidents: boolean;
  exemptionLevel: IAPIExemptionLevel;
  country: IAPICabotageCountry;
  appliedRegionCabotageExemptions?: (IAPIRegionExemption)[] ;
  appliedCountryCabotageExemptions?: (IAPICountryExemption)[] ;
  cabotageEnforcedForFARTypes?: (IAPICabotageFARType)[];
}
export interface IAPIExemptionLevel {
  cabotageExemptionLevelId: number;
  name: string;
}
export interface IAPICabotageCountry {
  countryId: number;
  code: string;
  name: string;
}
export interface IAPIRegionExemption {
  appliedRegionCabotageExemptionId: number;
  region: IAPICabotageRegion;
}
export interface IAPICabotageRegion {
  regionId: number;
  code: string;
  name: string;
  regionType: IAPIRegionType;
}
export interface IAPIRegionType {
  regionTypeId: number;
  name: string;
}
export interface IAPICountryExemption {
  appliedCountryCabotageExemptionId: number;
  country: IAPICabotageCountry;
}
export interface IAPICabotageFARType {
  cabotageEnforcedForFARTypeId: number;
  permitFarTypeId: number;
  name: string;
  cappsCode: string;
}
export interface IAPICabotageRequest extends IBaseApiResponse {
  isCabotageEnforced: boolean;
  cabotageExemptionLevelId: number;
  isImportationFeesforDomesticFlight: boolean;
  isCustomsStopsExempt: boolean;
  isPaxMustDepartwithSameOperator: boolean;
  isNoNewPaxAllowedtoDepart: boolean;
  isCabotageAppliestoLivestock: boolean;
  isCabotageAppliestoCargo: boolean;
  isCabotageAppliestoNonResidents: boolean;
  countryId?: number;
  appliedRegionCabotageExemptions?: (IAPIRegionExemptionRequest)[] | null;
  appliedCountryCabotageExemptions?: (IAPICountryExemptionRequest)[] | null;
  cabotageEnforcedForFARTypes?: (CabotageFARTypesRequest)[] | null;
}
export interface IAPIRegionExemptionRequest {
  id: number;
  regionId: number;
}
export interface IAPICountryExemptionRequest {
  id: number;
  countryId: number;
}
export interface CabotageFARTypesRequest {
  id: number;
  permitFARTypeId: number;
  name: string;
  cappsCode: string;
}
