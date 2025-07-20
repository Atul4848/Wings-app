import { IAPIHoursTime, IAPISchedule } from '@wings-shared/scheduler';
import { IAPIAirportHoursSubTypes, IAPICondition } from './index';
import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIAirport } from '@wings/shared';

export interface IAPIAirportHours extends IBaseApiResponse {
  airport?: IAPIAirport;
  airportId: number;
  airportHourId?: number;
  airportHoursTypeId: number;
  airportHoursSubTypeId: number;
  schedule: IAPISchedule;
  cappsSequenceId?: number;
  notam: string;
  sequenceId: number;
  isDst: boolean;
  icao: string;
  airportHoursRemarkId: number;
  airportHoursRemark?: IAirportHoursRemark;
  airportHoursType?: IAPIAirportHoursSubTypes;
  airportHoursSubType?: IAPIAirportHoursSubTypes;
  conditions?: IAPICondition[];
  closureTypeId: number;
  startTime?: IAPIHoursTime;
  endTime?: IAPIHoursTime;
  cappsComment?: string;
  dmSourceNotes?: string;
  scheduleSummary?: string;
}

interface IAirportHoursRemark {
  airportHoursRemarkId: number;
  name: string;
}
