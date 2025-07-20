import { IAPILatLongCoordinate } from '@wings/shared';
import {
  IAPIAirportLocation,
  IAPIICAOCode,
  IAPIAirportLocationRequest,
  IAPIMilitaryUseType,
  IAPIAirportManagement,
  IAPIAirportFlightPlanInfo,
  IAPIAirportOperationalInfo,
  IAPIAirportRunway,
  IAPIAirportFrequency,
  IAPIAirportTimezone,
  ICurrentTimeZone,
  IAPIAirportCustom,
  IAPIAirportSecurity,
  IAPIVendorLocation,
} from '../Interfaces';
import { IAPIErrors, IAPIIdNameCode, IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAirport extends IAPIAirportRequest {
  airportId: number;
  airportLocation: IAPIAirportLocation;
  airportFacilityType?: IAPIAirportFacilityType;
  airportFacilityAccessLevel?: IAPIAirportFacilityAccessLevel;
  airportOfEntry: IAPIAirportOfEntry;
  militaryUseType?: IAPIMilitaryUseType;
  airportDataSource?: IAPIAirportDataSource;
  airportManagement?: IAPIAirportManagement;
  airportFlightPlanInfo?: IAPIAirportFlightPlanInfo;
  airportOperationalInfo?: IAPIAirportOperationalInfo;
  airportSecurity?: IAPIAirportSecurity;
  airportFrequencies?: IAPIAirportFrequency[];
  runways: IAPIAirportRunway[];
  timeZones?: IAPIAirportTimezone[];
  currentTimezone?: ICurrentTimeZone;
  primaryRunway?: IAPIPrimaryRunway;
  hasErrors?: boolean;
  errors?: IAPIErrors[];
  latitudeCoordinate?: IAPILatLongCoordinate;
  longitudeCoordinate?: IAPILatLongCoordinate;
  displayCode?: string;
  customs?: IAPIAirportCustom;
  vendorLocations?:IAPIVendorLocation[]
}

// Add update request
export interface IAPIAirportRequest extends IBaseApiResponse {
  icaoCodeId: number;
  icaoCode?: IAPIICAOCode;
  uwaCode: string;
  iataCode: string;
  name: string;
  cappsAirportName: string;
  sourceLocationId: string;
  faaCode: string;
  regionalCode: string;
  inactiveReason: string;
  latitude: number;
  longitude: number;
  airportDataSourceId: number;
  airportFacilityTypeId: number;
  airportFacilityAccessLevelId: number;
  militaryUseTypeId?: number;
  primaryRunwayId: number;
  airportOfEntryId: number;
  isTopUsageAirport: boolean;
  appliedAirportType?: IAPIAppliedAirportType[];
  appliedAirportUsageType: IAPIAppliedAirportUsageType[];
  airportLocation: IAPIAirportLocationRequest;

  // implemented as per 132543
  uwaAirportCode?: IAPICodeSettings;
  regionalAirportCode?: IAPICodeSettings;
  uwaAirportCodeId: number;
  regionalAirportCodeId: number;
}

interface IAPIAppliedAirportType extends IAPIAirportType {
  airportId: number;
  airportType?: IAPIAirportType;
  appliedAirportTypeId?: number;
}

interface IAPIAppliedAirportUsageType extends IAPIUsageType {
  airportId?: number;
  airportUsageType?: IAPIUsageType;
}

interface IAPIAirportFacilityType extends IBaseApiResponse {
  airportFacilityTypeId: number;
}

interface IAPIAirportType extends IBaseApiResponse {
  airportTypeId: number;
}

interface IAPIUsageType extends IBaseApiResponse {
  airportUsageTypeId: number;
}

interface IAPIAirportFacilityAccessLevel extends IBaseApiResponse {
  airportFacilityAccessLevelId: number;
}

interface IAPIAirportDataSource extends IBaseApiResponse {
  airportDataSourceId: number;
}

interface IAPIAirportOfEntry extends IBaseApiResponse {
  airportOfEntryId: number;
}

interface IAPIPrimaryRunway extends IAPIAirportRunway {
  primaryRunwayId: number;
}

export interface IAPIUpdateUWAorICAOCode {
  airportId: number;
  icaoCodeId?: number; // required only updating icao code
  uwaAirportCodeId?: number;
  regionalAirportCodeId?: number;
  code?: number;
  appliedAirportUsageType?: IAPIAppliedAirportUsageType[];
}

export interface IAPIValidateAirport {
  id?: number;
  icaoCodeId?: number;
  uwaAirportCodeId?: number;
  regionalAirportCodeId?: number;
  iataCode?: string;
  faaCode?: string;
  sourceLocationId?: string;
  countryCode?: string;
  airportDataSourceId: number;
  airportOfEntryId: number;
  appliedAirportUsageType: IAPIAppliedAirportUsageType[];
}

export interface IAPICodeSettings extends IBaseApiResponse {
  uwaAirportCodeId?: number;
  regionalAirportCodeId?: number;
  code: string;
}

export interface IAPIAirportCategory extends IBaseApiResponse {
  airportCategoryId?: number;
  description: string;
}
