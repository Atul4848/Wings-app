import { ITestFrequency } from './API-TestFrequency.interface';
import { IAPIPaxCrew } from './API-PaxCrew.interface';
import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIStayRequirement extends IBaseApiResponse {
  paxCrewId: number;
  paxCrew?: IAPIPaxCrew;
  isStayRequired: boolean;
  stayLength?: number;
  isVaccineExemption?: boolean;
  isGovernmentHealthCheckRequired?: boolean;
  isTestRequired?: boolean;
  isLengthOfStay?: boolean;
  testTypeId?: number;
  testType?: ITestType;
  testVendorAllowed?: string;
  isSpecificHotelsOnly?: boolean;
  isCrewDesignationChange?: boolean;
  crewDesignationChangeLengthOfStay?: number;
  extraInformation?: string;
  hotelsAllowed?: IHotelAllowed[];
  testFrequencies?: ITestFrequency[];
  stayLengthCategory?: IAPIStayLengthCategory;
  stayLengthCategoryId?: number;
  isInherited: boolean;
  testFrequency?: string;
}

interface ITestType extends IBaseApiResponse {
  testTypeId?: number;
}

export interface IHotelAllowed extends IBaseApiResponse {
  hotelsAllowedId?: number;
}

interface IAPIStayLengthCategory extends IBaseApiResponse {
  stayLengthCategoryId: number;
}
