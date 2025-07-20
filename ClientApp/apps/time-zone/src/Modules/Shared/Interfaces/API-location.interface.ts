import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPILocation extends IBaseApiResponse {
  locationPk: number;
  locationId: number;
  state?: string;
  year: number;
  regionId: number;
  regionName: string;
  countryId: number;
  countryName: string;
  timeZoneId?: number;
}
