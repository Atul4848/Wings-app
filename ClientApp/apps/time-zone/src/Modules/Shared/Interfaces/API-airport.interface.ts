import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAirport extends IBaseApiResponse {
  airportId: number;
  officialICAOCode?: string;
  faaCode: string;
  message: string;
  inActive: boolean;
  reason?: string;
  locationId?: number;
  locationName?: string;
  longitudeDegrees: number;
  latitudeDegrees: number;
  airportLocationId: number;
}
