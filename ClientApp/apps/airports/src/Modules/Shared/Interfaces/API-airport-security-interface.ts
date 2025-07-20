import { IBaseApiResponse } from '@wings-shared/core';

export type SelectType = boolean | null;

export interface IAPIAirportSecurity extends IAPIAirportSecurityRequest {
  rampSideAccess: IAPIRampSideAccess;
  rampSideAccess3rdParty: IAPIRampSideAccess3rdParty;
}

export interface IAPIAirportSecurityRequest extends IBaseApiResponse {
  airportId: number;
  airportSecurityId?: number;
  rampSideAccessNonOpsDuringStay: string;
  securityNotes: string;
  rampSideAccessId: number | null;
  rampSideAccess3rdPartyId: number | null;
  airportFencing: SelectType;
  airportPolice: SelectType;
  crewScreening: SelectType;
  passengerScreening: SelectType;
  baggageScreening: SelectType;
  securityPatrols: SelectType;
  privateSecurityAllowed: SelectType;
  securityOrCompanyIdRqrdForCrew: SelectType;
  uniformRequiredForCrew: SelectType;
  airportSecurityViaAirportAuthorityOnly: SelectType;
  airportSecurity24Hours: SelectType;
  appliedRampSideAccess3rdPartyVendors: IAPIRampSideAccess3rdPartyVendors[];
  appliedParkingAreaSecurityMeasures: IAPIParkingAreaSecurityMeasures[];
  appliedGAParkingSecurityMeasures: IAPIGaParkingSecurityMeasures[];
  appliedAirportSecurityMeasures: IAPIAirportSecurityMeasures[];
  appliedRecommendedSecurityServices: IAPIRecommendedSecurityServices[];
}

interface IAPIRampSideAccess extends IBaseApiResponse {
  rampSideAccessId: number;
}

interface IAPIRampSideAccess3rdParty extends IBaseApiResponse {
  rampSideAccess3rdPartyId: number;
}

interface IAPIRampSideAccess3rdPartyVendors extends IBaseApiResponse {
  appliedRampSideAccess3rdPartyVendorId?: number;
  rampSideAccess3rdPartyVendor?: { rampSideAccess3rdPartyVendorId: number; name: string };
}

interface IAPIParkingAreaSecurityMeasures extends IBaseApiResponse {
  appliedParkingAreaSecurityMeasureId?: number;
  parkingAreaSecurityMeasure?: { parkingAreaSecurityMeasureId: number; name: string };
}

interface IAPIGaParkingSecurityMeasures extends IBaseApiResponse {
  appliedGAParkingSecurityMeasureId?: number;
  gaParkingSecurityMeasure?: { gaParkingSecurityMeasureId: number; name: string };
}

interface IAPIAirportSecurityMeasures extends IBaseApiResponse {
  appliedAirportSecurityMeasureId?: number;
  airportSecurityMeasure?: { airportSecurityMeasureId: number; name: string };
}

interface IAPIRecommendedSecurityServices extends IBaseApiResponse {
  appliedRecommendedSecurityServiceId?: number;
  recommendedService?: { recommendedServiceId: number; name: string };
}
