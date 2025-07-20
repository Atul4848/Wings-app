import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIAirportHoursSubTypes, IAPIAirportHoursType } from './API-airport-hours-sub-types.interface';

export interface IAPIAirportHoursRemarks extends IBaseApiResponse {
  sequenceId: number;
  airportHoursRemarkId?: number;
  airportHoursSubTypeId?: number;
  airportHoursSubType?: IAPIAirportHoursSubTypes;
  airportHoursType?: IAPIAirportHoursType;
}
