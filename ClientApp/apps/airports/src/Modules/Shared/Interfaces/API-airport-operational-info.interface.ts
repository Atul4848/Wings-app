import { IAPIAirportCategory } from './API-airport.interface';
import { IAPIAirportARFFCertification, IAPIAirportARFFCertificationRequest } from './index';
import { IBaseApiResponse, IAPIIdNameCode } from '@wings-shared/core';

export interface IAPIAirportOperationalInfo extends IAPIAirportOperationalInfoRequest {
  airportOperationalInfoId?: number;
  airportCategory: IAPIAirportCategory;
  weatherReportingSystem: IAPIWeatherReportingSystem;
  airportARFFCertification: IAPIAirportARFFCertification;
  metro: IAPIMetro;
  weightUOM: IAPIWeightUOM;
  jurisdiction: IAPIJurisdiction;
  customers: IAPICustomer[];
  worldAwareLocation: IAPIWorldAwareLocation;
  noise: IAPIAirportNoise;
  fuel: IAPIAiportFuel;
  isOwnTowbarRequired: boolean;
  appliedLargeAircraftRestrictions: IAPIAppliedLargeAircraftRestrictionsResponse[];
  airportParking: IAPIAirportParking;
}

export interface IAPIAirportOperationalInfoRequest extends IBaseApiResponse {
  airportId?: number;
  airportCategoryId: number;
  weatherReportingSystemId: number;
  worldAwareLocationId: number;
  weightLimit: number;
  wingspanLimit: number;
  tdWeekdayMorningRushHour: number;
  tdWeekdayAfternoonRushHour: number;
  tdWeekend: number;
  allOtherTimes: number;
  isGAFriendly: boolean;
  isRuralAirport: boolean;
  isDesignatedPointOfEntry: boolean;
  unattended: boolean;
  isMandatoryHandling: boolean;
  isForeignBasedEntity: boolean;
  commercialTerminalAddress: string;
  jurisdictionId: number;
  jurisdictionName: string;
  jurisdictionCode: string;
  metroId: number;
  weightUOMId: number;
  metroName: string;
  customers: IAPICustomer[];
  airportARFFCertification: IAPIAirportARFFCertificationRequest;
  airportA2GAgentProfileBlobUrl: string;
  airportA2GAgentProfileBlobAccessTokenUrl?: string;
  noise: IAPIAirportNoise;
  fuel: IAPIAiportFuelRequest;
  isOwnTowbarRequired: boolean;
  appliedLargeAircraftRestrictions: IAPIAppliedLargeAircraftRestrictionsRequest[];
  airportParking: IAPIAirportParking;
}

interface IAPIJurisdiction extends IAPIIdNameCode {
  jurisdictionId: number;
}

interface IAPIMetro extends IAPIIdNameCode {
  metroId: number;
}

interface IAPIWeightUOM extends IAPIIdNameCode {
  weightUOMId: number;
}

interface IAPIWeatherReportingSystem extends IBaseApiResponse {
  weatherReportingSystemId: number;
}

interface IAPIWorldAwareLocation extends IBaseApiResponse {
  worldAwareLocationId: number;
}

export interface IAPICustomer {
  id?: number;
  name: string;
  customerId: number;
}

export interface IAPIAirportDiagram extends IBaseApiResponse {
  diagramUrl: string;
}
export interface IAPIAgentProfile extends IBaseApiResponse {
  profileUrl: string;
}
export interface IAPIAirportNoise extends IBaseApiResponse{
  noiseId?: number;
  noiseAbatementProcedure: boolean;
  noiseAbatementContact: number;
}

//--------FUEL FIELDS--------//
export interface IAPIAiportFuel extends IBaseApiResponse {
  fuelId: number;
  fuelingFacilities: string;
  fuelingHours: string;
  appliedFuelTypes: IAPIAppliedFuelType[];
  appliedOilTypes: IAPIAppliedOilType[];
}
export interface IAPIAppliedFuelType extends IBaseApiResponse {
  fuelId: number;
  fuelType: IAPIFuelType;
}
export interface IAPIAppliedOilType extends IBaseApiResponse {
  fuelId: number;
  oilType: IAPIOilType;
}
export interface IAPIFuelType extends IBaseApiResponse {
  fuelTypeId: number;
}
export interface IAPIOilType extends IBaseApiResponse {
  oilTypeId: number;
}

export interface IAPIAiportFuelRequest {
  id: number;
  fuelingFacilities: string;
  fuelingHours: string;
  appliedFuelTypes?: IAPIFuelType[];
  appliedOilTypes?: IAPIOilType[];
}

//-------Large Aircraft Restriction-----//
export interface IAPIAppliedLargeAircraftRestrictionsRequest
  extends IBaseApiResponse {
  largeAircraftRestrictionId: number;
}

export interface IAPILargeAircraftRestriction {
  largeAircraftRestrictionId: number;
  name: string;
}

export interface IAPIAppliedLargeAircraftRestrictionsResponse {
  id: number;
  largeAircraftRestriction: IAPILargeAircraftRestriction;
}

//--------AIRPORT PARKING FIELDS--------//
export interface IAPIAirportParking extends IBaseApiResponse {
  airportParkingId?: number;
  maximumParkingDuration: number;
  overnightParking: IAPIOvernightParking;
  appliedParkingAlternateAirports: IAPIParkingAlternateAirport[];
  airportSeasonalParking: IAPISeasonalParkingDifficulty[];
}
interface IAPISeasonalParkingDifficulty {
  id: number;
  airportSeasonalParkingId?: number;
  seasonalParkingDifficultyMonth?: IMonth;
}

export interface IAPIAirportParkingRequest extends IBaseApiResponse {
  maximumParkingDuration: number;
  overnightParkingId: number;
  appliedParkingAlternateAirports: IAPIParkingAlternateAirport[];
  airportSeasonalParking: ISeasonalParking[];
}

interface ISeasonalParking {
  id: number;
  seasonalParkingDifficultyMonth: number;
}

interface IMonth {
  seasonalParkingDifficultyMonthId: number;
  name: string;
}

export interface IAPIOvernightParking {
  OvernightParkingId: number;
  id: number;
  name: string;
}

export interface IAPIParkingAlternateAirport {
  id: number;
  appliedParkingAlternateAirportId?: number;
  airport?: IAirport;
}

interface IAirport {
  airportId: number;
  displayCode: string;
  airportName: string;
  name: string;
  code: string;
}
