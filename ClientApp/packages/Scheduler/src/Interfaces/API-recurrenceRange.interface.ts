import { IBaseApiResponse } from '@wings-shared/core';
import { RECURRENCE_RANGE_TYPE } from '../Enums';

export interface IAPIRecurrenceRange extends IBaseApiResponse {
  recurrenceRangeTypeId: RECURRENCE_RANGE_TYPE;
  patternedRecurrenceId: number;
  startDate: string;
  endDate?: string;
  numberOfOccurrences: number;
  recurrenceRangeType?: RecurrenceRangeType;
}

interface RecurrenceRangeType {
  recurrenceRangeTypeId: number;
  name: string;
}
