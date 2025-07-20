import { IBaseApiResponse } from './BaseApiResponse.interface';
export interface IAPITimeZoneBase extends IBaseApiResponse {
  regionId: number;
  regionName: string;
  countryId: number;
  countryName: string;
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
  source: string;
}
