import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIPaxCrew } from './API-PaxCrew.interface';

export interface IAPIQuarantineRequirement extends IBaseApiResponse {
  healthAuthorizationId?: number;
  quarantineRequirementId?: number;
  isQuarantineRequired: boolean;
  isSymptomsBased?: boolean;
  isTravelHistoryBased?: boolean;
  traveledCountries?: string;
  previousTimeFrame?: number;
  periodOfQuarantineRequired?: number;
  isGovtSelfMonitoringRequired?: boolean;
  monitoringMethod?: string;
  isTestExemption?: boolean;
  testModifications?: string;
  testInformation?: string;
  extraInformation?: string;
  isAgeExemption?: boolean;
  age?: number;
  paxCrewId: number;
  quarantineRequirementLocations?: number[];
  paxCrew?: IAPIPaxCrew;
  quarantineLocations?: IAPIQuarantineLocation[];
  quarantineTraveledCountries?: IAPIQuarantineTraveledCountrie[];
  isLengthOfStay?: boolean;
  isInherited: boolean;
}

export interface IAPIQuarantineLocation extends IBaseApiResponse {
  quarantineLocationId?: number;
}

export interface IAPIQuarantineTraveledCountrie extends IBaseApiResponse {
  healthAuthorizationid?: number;
  quarantineTraveledCountryId?: number;
  travelCountryId: number;
  travelCountryCode: string;
}
