import { IBaseApiResponse } from '@wings-shared/core';
import { IAPITimeZoneRegion } from './API-time-zone.interface';

export interface IAPIAirportLocation extends IBaseApiResponse {
  timezoneRegionId: number;
  timezoneRegionName: string;
  timezoneRegion: IAPITimeZoneRegion;
  airportId: number;
  airportCode: string;
  iata: string;
  locationId?: number;
  locationName?: string;
  longitudeDegrees: number;
  latitudeDegrees: number;
  airportLocationId: number;
  currentZoneName: string;
  currentZoneAbbreviation: string;
  year: number;
  currentOffset: string;
  zoneTotalOffsetInSeconds: number;
  currentZoneStart: string;
  error?: string;
}

export interface IAPIStagingAirportRegion extends IBaseApiResponse {
  stagingAirportRegionId?: number;
  timeZoneId: number;
  timeZoneRegion: Partial<IAPITimeZoneRegion>;
  airportId: number;
  airportCode: string;
  longitudeDegrees: number;
  latitudeDegrees: number;
  currentZoneName: string;
  currentZoneAbbreviation: string;
  year: number;
  currentOffset: string;
  zoneTotalOffsetInSeconds: number;
  currentZoneStart: string;
  stagingStatusId: number;
  stagingStatusName: string;
  airportName: string;
}
