import { ISelectOption } from '@wings-shared/core';
import {
  AREA_TYPE,
  JOB_TYPE,
  BOOL_TYPE,
  SETTING_TYPE,
} from './Enums';
export const AreaTypeOptions: ISelectOption[] = [
  { label: AREA_TYPE.TRIP, value: AREA_TYPE.TRIP },
  { label: AREA_TYPE.FLIGHT_PLANNING, value: AREA_TYPE.FLIGHT_PLANNING },
  { label: AREA_TYPE.HANGFIRE, value: AREA_TYPE.HANGFIRE },
  { label: AREA_TYPE.FIQ, value: AREA_TYPE.FIQ },
  { label: AREA_TYPE.USER, value: AREA_TYPE.USER },
];

export const SettingTypeOptions: ISelectOption[] = [
  { label: SETTING_TYPE.RECURRING, value: SETTING_TYPE.RECURRING },
  { label: SETTING_TYPE.SETTING, value: SETTING_TYPE.SETTING },
];
export const JobTypeOptions: ISelectOption[] = [
  { label: JOB_TYPE.INT, value: JOB_TYPE.INT },
  { label: JOB_TYPE.STRING, value: JOB_TYPE.STRING },
  { label: JOB_TYPE.BOOL, value: JOB_TYPE.BOOL },
];
export const BoolTypeOptions: ISelectOption[] = [
  { label: BOOL_TYPE.TRUE, value: BOOL_TYPE.TRUE },
  { label: BOOL_TYPE.FALSE, value: BOOL_TYPE.FALSE },
];