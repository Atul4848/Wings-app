import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIATSAirport extends IBaseApiResponse {
  airportId: number;
  officialICAOCode: string;
  faaCode: string;
  uwaAirportCode: string;
  iata: string;
  billingIATA: string;
  airportName: string;
  longitudeDegrees: number;
  latitudeDegrees: number;
  airportUsageTypeId: number;
  airportLandingTypeId: number;
  airportFrequencyId: number;
  statusName: string;
  cityCode: string;
  countryCode: string;
  error: string;
  icao: string;
  stateCode: string;
  utcToDaylightSavingsConversion: string;
  utcDayLightSavingsStart: string;
  utcDayLightSavingsEnd: string;
  utcToStandardTimeConversion: string;
  utcStandardTimeStart: string;
  utcStandardTimeEnd: string;
  inactive: boolean;
}
