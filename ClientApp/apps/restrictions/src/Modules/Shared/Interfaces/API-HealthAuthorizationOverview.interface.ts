import { IAPIState } from '@wings/shared';
import { IAPIAirport } from './index';
import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIHealthAuthorizationOverview extends IBaseApiResponse {
  healthAuthorizationId?: number;
  authorizationLevel?: IApiAthorizationLevel;
  infectionType?: IApiInfectionType;
  affectedType?: IApiAffectedType;
  levelDesignator?: IApiLevelDesignator;
  healthAuthorizationNationalitiesRegion?: IApiNationalitiesRegion;
  authorizationLevelEntityId: number;
  authorizationLevelEntityCode: string;
  isAllTraveledCountries: boolean;
  isAllNationalities: boolean;
  healthAuthorizationTraveledCountries?: IApiHealthAuthTravelledCountries[];
  healthAuthorizationNationalities?: IApiHealthAuthNationalities[];
  healthAuthorizationExcludedTraveledCountries?: IApiHealthAuthTravelledCountries[];
  healthAuthorizationExcludedNationalities?: IApiHealthAuthNationalities[];
  authorizationLevelId: number;
  infectionTypeId: number;
  affectedTypeId: number;
  levelDesignatorId: number;
  receivedBy: string;
  receivedDate: string;
  requestedBy: string;
  requestedDate: string;
  isSuspendNotification: boolean;
  statusChangeReason: string;
  healthAuthorizationCloneId: number;
  parentId?: number;
  daysCountToReceivedDate: number;
  daysCountToRequestedDate: number;
}

export interface IApiAthorizationLevel extends IBaseApiResponse {
  authorizationLevelId: number;
  name: string;
  airport: IAPIAirport;
  country: IAPICountry;
  state: IAPIState;
}

export interface IApiHealthAuthTravelledCountries extends IAPICountry {
  healthAuthorizationId: number;
  travelCountryId: number;
  travelCountryCode: string;
}

export interface IApiHealthAuthNationalities extends IAPICountry {
  healthAuthorizationId: number;
  nationalityCountryId: number;
  nationalityCountryCode: string;
}

export interface IAPICountry extends IBaseApiResponse {
  countryId?: number;
  code?: string;
}

interface IApiInfectionType extends IBaseApiResponse {
  infectionTypeId: number;
}

interface IApiAffectedType extends IBaseApiResponse {
  affectedTypeId: number;
}

interface IApiLevelDesignator extends IBaseApiResponse {
  levelDesignatorId: number;
}

interface IApiNationalitiesRegion {
  regionId: number;
  regionName: string;
  regionCode: string;
  code?: string;
  name?: string;
}
