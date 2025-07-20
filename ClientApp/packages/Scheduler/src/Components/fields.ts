import moment from 'moment';
import {
  RECURRENCE_PATTERN_TYPE,
  WEEK_INDEX,
  DAYS_OF_WEEK,
  DATE_TIME_TYPE,
  SUNSET_SUNRISE_TYPE,
  RECURRENCE_RANGE_TYPE,
  SCHEDULE_TYPE,
} from '../Enums';
import { SettingsTypeModel, SelectOption } from '@wings-shared/core';

export const inputProps = { min: 1, max: 99 };

export const weekIndexOptions: SelectOption[] = [
  new SelectOption({ name: 'First', value: WEEK_INDEX.FIRST }),
  new SelectOption({ name: 'Second', value: WEEK_INDEX.SECOND }),
  new SelectOption({ name: 'Third', value: WEEK_INDEX.THIRD }),
  new SelectOption({ name: 'Fourth', value: WEEK_INDEX.FOURTH }),
];

export const monthOptions: SelectOption[] = moment
  .months()
  .map((name: string, index: number) => new SelectOption({ name, value: index + 1 }));

// TEMP!! USE LATER WILL GET FROM API
export const daysOfWeekOptions: SelectOption[] = [
  new SelectOption({ name: 'Sunday', value: DAYS_OF_WEEK.SUNDAY }),
  new SelectOption({ name: 'Monday', value: DAYS_OF_WEEK.MONDAY }),
  new SelectOption({ name: 'Tuesday', value: DAYS_OF_WEEK.TUESDAY }),
  new SelectOption({ name: 'Wednesday', value: DAYS_OF_WEEK.WEDNESDAY }),
  new SelectOption({ name: 'Thursday', value: DAYS_OF_WEEK.THURSDAY }),
  new SelectOption({ name: 'Friday', value: DAYS_OF_WEEK.FRIDAY }),
  new SelectOption({ name: 'Saturday', value: DAYS_OF_WEEK.SATURDAY }),
];

export const recurrencePatternOptions: SelectOption[] = [
  new SelectOption({ name: 'Daily', value: RECURRENCE_PATTERN_TYPE.DAILY }),
  new SelectOption({ name: 'Weekly', value: RECURRENCE_PATTERN_TYPE.WEEKLY }),
  new SelectOption({ name: 'Monthly', value: RECURRENCE_PATTERN_TYPE.MONTHLY }),
  new SelectOption({ name: 'Yearly', value: RECURRENCE_PATTERN_TYPE.YEARLY }),
];

export const monthTypeOptions: SelectOption[] = [
  new SelectOption({ name: 'Relative', value: RECURRENCE_PATTERN_TYPE.RELATIVE_MONTHLY }),
  new SelectOption({ name: 'Absolute', value: RECURRENCE_PATTERN_TYPE.MONTHLY }),
];

export const yearTypeOptions: SelectOption[] = [
  new SelectOption({ name: 'Relative', value: RECURRENCE_PATTERN_TYPE.RELATIVE_YEARLY }),
  new SelectOption({ name: 'Absolute', value: RECURRENCE_PATTERN_TYPE.YEARLY }),
];

export const dateTimeTypeOptions: SettingsTypeModel[] = [
  new SettingsTypeModel({ name: 'Local', id: DATE_TIME_TYPE.LOCAL }),
  new SettingsTypeModel({ name: 'Zulu', id: DATE_TIME_TYPE.ZULU }),
];

export const seunsetSunriseOptions: SettingsTypeModel[] = [
  new SettingsTypeModel({ name: 'None', id: SUNSET_SUNRISE_TYPE.NONE }),
  new SettingsTypeModel({ name: 'Sunrise', id: SUNSET_SUNRISE_TYPE.SUNRISE }),
  new SettingsTypeModel({ name: 'Sunset', id: SUNSET_SUNRISE_TYPE.SUNSET }),
];

export const recurrenceRangeTypeOptions: SettingsTypeModel[] = [
  new SettingsTypeModel({ name: 'Specific Date', id: RECURRENCE_RANGE_TYPE.END_DATE }),
  new SettingsTypeModel({ name: 'No End Date', id: RECURRENCE_RANGE_TYPE.NO_END }),
  new SettingsTypeModel({ name: 'End After', id: RECURRENCE_RANGE_TYPE.NUMBERED }),
];

export const scheduleTypeOptions: SettingsTypeModel[] = [
  new SettingsTypeModel({ name: 'Recurrence', id: SCHEDULE_TYPE.RECURRENCE }),
  new SettingsTypeModel({ name: 'Continuous', id: SCHEDULE_TYPE.CONTINUES }),
  new SettingsTypeModel({ name: 'No Schedule', id: SCHEDULE_TYPE.SINGLE_INSTANCE }),
];

export const recurrencePatternViews: SelectOption[] = [
  new SelectOption({ name: 'Daily', value: RECURRENCE_PATTERN_TYPE.DAILY }),
  new SelectOption({ name: 'Weekly', value: RECURRENCE_PATTERN_TYPE.WEEKLY }),
  new SelectOption({ name: 'Absolute', value: RECURRENCE_PATTERN_TYPE.MONTHLY }),
  new SelectOption({ name: 'Relative', value: RECURRENCE_PATTERN_TYPE.RELATIVE_MONTHLY }),
  new SelectOption({ name: 'Absolute', value: RECURRENCE_PATTERN_TYPE.YEARLY }),
  new SelectOption({ name: 'Relative', value: RECURRENCE_PATTERN_TYPE.RELATIVE_YEARLY }),
];
