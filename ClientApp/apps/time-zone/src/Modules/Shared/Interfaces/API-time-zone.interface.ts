import { IAPITimeZoneBase, IBaseApiResponse } from '@wings-shared/core';
import { IAPILocation } from './index';

export interface IAPITimeZone extends IBaseApiResponse {
  timeZoneId: number;
  year: number;
  zoneName: string;
  zoneAbbreviation: string;
  offset: string;
  zoneOffset: number;
  zoneDst: number;
  zoneTotalOffset: number;
  newLocalTime: string;
  oldLocalTime: string;
  utcLocalTime: string;
  startDateTime?: string;
  endDateTime?: string;
  countryName?:string
}

export interface IAPIStagingTimeZone extends IBaseApiResponse {
  stagingTimeZoneId: number;
  timeZoneId: number;
  timezoneRegionId: number;
  year: number;
  zoneName: string;
  zoneAbbreviation: string;
  offset: string;
  zoneOffset: number;
  zoneDst: number;
  zoneTotalOffset: number;
  newLocalTime: string;
  oldLocalTime: string;
  utcLocalTime: string;
  stagingStatusId: number;
  stagingStatusName: string;
  timezoneRegion: IAPITimeZoneRegion;
  startDateTime?: string;
  endDateTime?: string;
}

export interface IAPITimeZoneRegion extends IBaseApiResponse {
  regionName: string;
  countryCode: string;
  countryName: string;
  noDst: boolean;
  reason: string;
  description: string;
}
