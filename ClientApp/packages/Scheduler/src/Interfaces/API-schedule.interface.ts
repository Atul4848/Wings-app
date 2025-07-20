import { DATE_TIME_TYPE, SCHEDULE_TYPE } from '../Enums';
import { IAPIHoursTime } from '../Interfaces';
import { IAPIRecurrence } from './index';
import { IBaseApiResponse } from '@wings-shared/core';

interface IAPIScheduleBase extends IBaseApiResponse {
  scheduleId?: number;
  stddstTypeId?: number;
  timeTypeId?: DATE_TIME_TYPE;
  startDate?: string;
  endDate?: string;
  durationInMinutes?: number;
  is24Hours?: boolean;
  patternedRecurrence?: IAPIRecurrence;
  scheduleTypeId: SCHEDULE_TYPE;
  startDateTimeZoneId?: number; // @ deprecated will remove after API refactor
  endDateTimeZoneId?: number; // @ deprecated will remove after API refactor
  startDateTime?: string; // Used in events
  endDateTime?: string; // Used in events
  timeType?: ITimeType;
  stddstType?: ISTDDSTType;
  includeHoliday?: boolean;
  scheduleType?: IScheduleType;
}

export interface IAPISchedule extends IAPIScheduleBase {
  startTime?: IAPIHoursTime;
  endTime?: IAPIHoursTime;
}

export interface IAPIEventSchedule extends IAPIScheduleBase {
  eventScheduleId?: number;
  eventScheduleTypeId: SCHEDULE_TYPE;
  eventScheduleType?: IScheduleType;
  isAllDay?: boolean;
  startTime?: string;
  endTime?: string;
}

interface IScheduleType {
  scheduleTypeId: number;
  name: string;
}

interface ITimeType {
  timeTypeId: number;
  name: string;
}

interface ISTDDSTType {
  stddstTypeId: number;
  name: string;
}
