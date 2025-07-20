import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIRecurrencePattern extends IBaseApiResponse {
  recurrencePatternTypeId: number;
  patternedRecurrenceId: number;
  interval: number;
  month?: number;
  dayOfMonth?: number;
  daysOfWeeks?: IDaysOfWeek[];
  firstDayOfWeekId?: number;
  weekIndexId?: number;
  eventScheduleId?: number;
  recurrencePatternType?: RecurrencePatternType;
}

interface RecurrencePatternType {
  recurrencePatternTypeId: number;
  name: string;
}

export interface IDaysOfWeek {
  id: number;
  recurrencePatternId: number;
  dayOfWeekId: number;
  dayOfWeek?: IWeekDay;
}

interface IWeekDay {
  dayOfWeekId: number;
  name: string;
}
