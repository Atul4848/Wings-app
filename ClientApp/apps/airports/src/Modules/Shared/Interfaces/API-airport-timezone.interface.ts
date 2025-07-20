import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAirportTimezone extends IBaseApiResponse {
  timeZoneId: number;
  zoneName: string;
  zoneAbbreviation: string;
  year: number;
  offset: string;
  zoneOffset: string;
  zoneDst: string;
  zoneTotalOffset: string;
  newLocalTime: string;
  oldLocalTime: string;
  utcLocalTime: string;
  startDateTime: string;
  endDateTime: string;
  message: any;
  timeZoneRegion: TimeZoneRegion;
}

export interface ICurrentTimeZone {
  currentZoneAbbreviation: string;
  curTimeZoneBeginDate: string;
  curTimeZoneEndDate: string;
  curTimeZoneBeginTime: string;
  curTimeZoneEndTime: string;
  curTimeZoneDiff: string;
  curZoneDST: number;
  curZoneOffset: number;
  nextZoneAbbreviation: string;
  nextTimeZoneBeginDate: string;
  nextTimeZoneEndDate: any;
  nextTimeZoneBeginTime: string;
  nextTimeZoneEndTime: any;
  nextTimeZoneDiff: string;
  nextZoneDST: number;
  nextZoneOffset: number;
}

export interface TimeZoneRegion {
  timeZoneRegionId: number;
  regionName: string;
}
