import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIAirport } from '@wings/shared';

export interface IAPIUAOffices extends IBaseApiResponse {
  uaOfficeId?: number;
  airportId: number;
  airportName?: string;
  airport?: IAPIAirport;
  icaoCodeId?: number;
  icaoCode?: string;
  uwaCode?: string;
}
