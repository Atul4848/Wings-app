import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIRecurrencePattern } from './API-recurrencePattern.interface';
import { IAPIRecurrenceRange } from './API-recurrenceRange.interface';

export interface IAPIRecurrence extends IBaseApiResponse {
  scheduleId: number;
  eventScheduleId?: number;
  recurrencePattern: IAPIRecurrencePattern;
  recurrenceRange: IAPIRecurrenceRange;
}
