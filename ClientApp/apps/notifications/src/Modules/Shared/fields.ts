import { ISelectOption } from '@wings-shared/core';
import { FIELD_TYPE, MESSAGE_LEVEL, DND_FILTER_TYPE, DAYS_OF_WEEK, DELIVERY_TYPE } from './Enums';

export const FieldTypeOptions: ISelectOption[] = [
  { label: FIELD_TYPE.STRING, value: FIELD_TYPE.STRING },
  { label: FIELD_TYPE.DATE, value: FIELD_TYPE.DATE },
  { label: FIELD_TYPE.BOOL, value: FIELD_TYPE.BOOL },
  { label: FIELD_TYPE.NUMBER, value: FIELD_TYPE.NUMBER },
  { label: FIELD_TYPE.DOUBLE, value: FIELD_TYPE.DOUBLE },
  { label: 'ZULU TIME', value: FIELD_TYPE.ZULU_TIME },
];

export const MessageLevelOptions: ISelectOption[] = [
  { label: MESSAGE_LEVEL.GENERAL, value: MESSAGE_LEVEL.GENERAL },
  { label: MESSAGE_LEVEL.WARNING, value: MESSAGE_LEVEL.WARNING },
  { label: MESSAGE_LEVEL.CRITICAL, value: MESSAGE_LEVEL.CRITICAL },
];

export const DNDFilterTypeOptions: ISelectOption[] = [
  { label: DND_FILTER_TYPE.INCLUSIVE, value: DND_FILTER_TYPE.INCLUSIVE },
  { label: DND_FILTER_TYPE.EXCLUSIVE, value: DND_FILTER_TYPE.EXCLUSIVE },
];

export const DaysOfWeekOptions: ISelectOption[] = [
  { label: DAYS_OF_WEEK.ALL, value: DAYS_OF_WEEK.ALL },
  { label: DAYS_OF_WEEK.SUNDAY, value: DAYS_OF_WEEK.SUNDAY },
  { label: DAYS_OF_WEEK.MONDAY, value: DAYS_OF_WEEK.MONDAY },
  { label: DAYS_OF_WEEK.TUESDAY, value: DAYS_OF_WEEK.TUESDAY },
  { label: DAYS_OF_WEEK.WEDNESDAY, value: DAYS_OF_WEEK.WEDNESDAY },
  { label: DAYS_OF_WEEK.THURSDAY, value: DAYS_OF_WEEK.THURSDAY },
  { label: DAYS_OF_WEEK.FRIDAY, value: DAYS_OF_WEEK.FRIDAY },
  { label: DAYS_OF_WEEK.SATURDAY, value: DAYS_OF_WEEK.SATURDAY },
];

export const DeliveryTypeOptions: ISelectOption[] = [
  { label: DELIVERY_TYPE.ALL, value: DELIVERY_TYPE.ALL },
  { label: DELIVERY_TYPE.EMAIL, value: DELIVERY_TYPE.EMAIL },
  { label: DELIVERY_TYPE.SMS, value: DELIVERY_TYPE.SMS },
];

export const CategoryEventTypeOptions: ISelectOption[] = [
  { label: 'Category Type', value: 'CategoryType' },
  { label: 'Event Type', value: 'EventType' },
];
