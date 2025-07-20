import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIHealthForm } from './API-HealthForm.interface';
import { IAPIPaxCrew } from './API-PaxCrew.interface';

export interface IAPIEntryRequirement extends IBaseApiResponse {
  arrivalTestEntryRequirement?: IAPIArrivalTestEntryRequirement;
  entryRequirementId: number;
  extraInformation?: string;
  isFormsRequired?: boolean;
  formRequirements?: IAPIEntryFormRequirement[];
  isEntryRequirements: boolean;
  isHealthInsuranceRequired?: boolean;
  isHealthScreeningOnArrival?: boolean;
  isHotelPreBookingRequired?: boolean;
  isPreApprovalRequired?: boolean;
  isPreTravelTestRequired?: boolean;
  isRandomScreeningTestingPossible?: boolean;
  isStayContactInfoRequired?: boolean;
  isTestRequiredOnArrival?: boolean;
  paxCrew?: IAPIPaxCrew;
  paxCrewId?: number;
  preApprovalEntryRequirement?: IAPIPreApprovalEntryRequirement;
  preTravelTestEntryRequirement?: IAPIPreTravelTestEntryRequirement;
  symptomaticUponArrivalRequirements?: string;
  typeOfHealthInsuranceRequired?: string;
  ageExemption?: number;
  covidRecoveredPassengerExemption?: string;
  entryRequirementBannedNationalities?: IAPIHealthAuthorizationBannedNationality[];
  entryRequirementBannedNationalityRegions?: IAPIBannedNationalityRegion[];
  isInherited: boolean;
}

export interface IAPIArrivalTestEntryRequirement extends IBaseApiResponse {
  arrivalTestEntryRequirementId: number;
}

export interface IAPIPreApprovalEntryRequirement extends IBaseApiResponse {
  preApprovalEntryRequirementId?: number;
  leadTime: number;
  landingPermitImplications: string;
}

export interface IAPIPreTravelTestEntryRequirement extends IBaseApiResponse {
  testTypeId?: number;
  testType?: IAPITestType;
  isProofRequiredBeforeBoarding: boolean;
  consequences: string;
  leadTime: number;
  leadTimeIndicatorId: number;
  leadTimeIndicator?: IAPIleadTimeIndicator;
  preTravelTestDetails?: IAPIPreTravelTestDetail[];
}

export interface IAPIPreTravelTestDetail extends IBaseApiResponse {
  preTravelTestDetailId?: number;
  testTypeId?: number;
  testType?: IAPITestType;
  leadTime: number;
  leadTimeIndicatorId: number;
  leadTimeIndicator?: IAPIleadTimeIndicator;
}

export interface IAPIleadTimeIndicator extends IBaseApiResponse {
  leadTimeIndicatorId?: number;
}

export interface IAPIEntryFormRequirement extends IBaseApiResponse {
  id: number;
  formRequirementId?: number;
  healthFormLink: string;
  instructions: string;
  leadTime: number;
  healthFormId: number;
  healthForm?: IAPIHealthForm;
}

export interface IAPITestType extends IBaseApiResponse {
  testTypeId?: number;
}
export interface IAPIHealthAuthorizationBannedNationality {
  bannedNationalityCountryId: number;
  bannedNationalityCountryCode: string;
  countryId?: number;
  name?: string;
  code?: string;
}

export interface IAPIBannedNationalityRegion {
  entryRequirementBannedNationalityRegionId?: number;
  region?: IAPIRegion;
  regionId: number;
  name: string;
  code: string;
}

interface IAPIRegion {
  id: number;
  regionId: number;
  name: string;
  code: string;
}
