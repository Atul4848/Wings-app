import { IBaseApiResponse } from '@wings-shared/core';

export interface IApiGeneralInfo extends IBaseApiResponse {
  usCrewPaxInfo: string;
  nonUSCrewPaxInfo: string;
  generalInfo: string;
  flightsAllowed?: IAPIFlightsAllowed[];
  activeDutyCrewDefinition: string;
  crewSwapOnlyLegDetails: string;
  isBusinessExemption: boolean;
  businessExemptions: string;
  isEssentialWorkersAllowed: boolean;
  serviceRestrictions: string;
  isTechStopAllowed: boolean;
  disinsectionSprayRequirements: string;
  isDisinsectionRequired: boolean;
  isAircraftDisinfectionRequired: boolean;
  isDocumentationRequired: boolean;
  isTopOfDescentSprayRequired: boolean;
  isFuelStopAllowed: boolean;
  disembarkationType: number;
  isAllFlightsAllowed: boolean;
  isNoFlightsAllowed: boolean;
  healthAuthorizationLinks?: IAPIHealthAuthorizationLink[];
  healthAuthorizationNOTAMs?: IAPIHealthAuthorizationNOTAM[];
  whoCanLeaveAircraft?: IAPIWhoCanLeaveAircraft;
  whoCanLeaveAircraftId: number;
  otherInformation: string;
  isCTSAccepted: boolean;
  flightsAllowedIds: number[];
  healthAuthorizationBannedTraveledCountries: IAPIHealthAuthorizationTraveledCountry[];
  isInherited: boolean;
}

export interface IAPIHealthAuthorizationTraveledCountry {
  bannedTraveledCountryId: number;
  bannedTraveledCountryCode: string;
  countryId?: number;
  name?: string;
  code?: string;
}

export interface IAPIFlightsAllowed extends IBaseApiResponse {
  flightsAllowedId: number;
}

export interface IAPIHealthAuthorizationLink extends IBaseApiResponse {
  link: string;
  description: string;
  healthAuthorizationLinkId?: number;
}

export interface IAPIHealthAuthorizationNOTAM extends IBaseApiResponse {
  healthAuthorizationNOTAMId?: number;
  notamNumber: string;
  affectedAirportId: number;
  affectedICAOCode: string;
  expiryDate: string;
  affectedAirport?: {
    airportId: number;
    code: string;
  };
}

export interface IAPIWhoCanLeaveAircraft extends IBaseApiResponse {
  whoCanLeaveAircraftId: number;
}
