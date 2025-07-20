import { IBaseApiResponse } from '@wings-shared/core';
import { SUNSET_SUNRISE_TYPE } from '../Enums';
export interface IAPIHoursTime extends IBaseApiResponse {
  time: string;
  offSet: number;
  solarTimeId: number;
  solarTime?: SUNSET_SUNRISE_TYPE;
}
