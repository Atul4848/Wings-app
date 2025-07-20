import { RecurrenceModel } from './Recurrence.model';
import { RECURRENCE_PATTERN_TYPE, SCHEDULE_TYPE, RECURRENCE_RANGE_TYPE, DATE_TIME_TYPE } from '../Enums';
import { IAPIEventSchedule, IAPISchedule } from '../Interfaces';
import { HoursTimeModel } from '../Models/HoursTime.model';
import { CoreModel, DATE_FORMAT, Utilities, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { dateTimeTypeOptions, scheduleTypeOptions } from '../Components/fields';

@modelProtection
export class ScheduleModel extends CoreModel {
  startDate: string = null;
  endDate: string = null;
  startTime: HoursTimeModel;
  endTime: HoursTimeModel;
  durationInMinutes: number = 0;
  is24Hours: boolean = false;
  patternedRecurrence?: RecurrenceModel;
  scheduleTypeId: SCHEDULE_TYPE = SCHEDULE_TYPE.RECURRENCE;
  timeTypeId: DATE_TIME_TYPE = DATE_TIME_TYPE.LOCAL;
  stddstTypeId: number = null;
  includeHoliday: boolean = false;

  // view Only
  timeType?: SettingsTypeModel = dateTimeTypeOptions[0];
  scheduleType?: SettingsTypeModel = scheduleTypeOptions[0];
  stddstType: SettingsTypeModel;
  // final message for recurrence
  recurrenceMessage: string = '';

  constructor(schedule?: Partial<ScheduleModel>) {
    super(schedule);
    Object.assign(this, schedule);
    this.patternedRecurrence = schedule?.patternedRecurrence || new RecurrenceModel();
    this.startTime = schedule?.startTime || new HoursTimeModel();
    this.endTime = schedule?.endTime || new HoursTimeModel();
  }

  // Used for Min Max Values
  public get startDateTime(): string {
    if (this.startDate) {
      return Utilities.combineDateTime(this.startDate, this.startTime?.time);
    }

    return this.startTime?.time;
  }

  public get endDateTime(): string {
    if (this.endDate) {
      return Utilities.combineDateTime(this.endDate, this.endTime?.time);
    }
    return this.endTime?.time;
  }

  public get isRecurring(): boolean {
    return this.scheduleType?.id === SCHEDULE_TYPE.RECURRENCE;
  }

  // get schedule object by schedule type
  static getScheduleType(scheduleType: SCHEDULE_TYPE): SettingsTypeModel {
    switch (scheduleType) {
      case SCHEDULE_TYPE.RECURRENCE:
        return scheduleTypeOptions[0];
      case SCHEDULE_TYPE.CONTINUES:
        return scheduleTypeOptions[1];
      default:
        return scheduleTypeOptions[2];
    }
  }

  static deserialize(apiData: IAPISchedule): ScheduleModel {
    if (!apiData) {
      return new ScheduleModel();
    }

    const data: Partial<ScheduleModel> = {
      id: apiData.scheduleId || apiData.id,
      startDate: apiData.startDate,
      endDate: apiData.endDate,
      startTime: HoursTimeModel.deserialize(apiData.startTime),
      endTime: HoursTimeModel.deserialize(apiData.endTime),
      scheduleType: SettingsTypeModel.deserialize({
        id: apiData.scheduleType?.scheduleTypeId,
        name: apiData.scheduleType?.name,
      }),
      timeType: SettingsTypeModel.deserialize({
        id: apiData.timeType?.timeTypeId || dateTimeTypeOptions[0].id,
        name: apiData.timeType?.name || dateTimeTypeOptions[0].name,
      }),
      stddstType: SettingsTypeModel.deserialize({
        id: apiData.stddstType?.stddstTypeId,
        name: apiData.stddstType?.name,
      }),
      scheduleTypeId: apiData.scheduleType?.scheduleTypeId,
      durationInMinutes: apiData.durationInMinutes,
      is24Hours: apiData.is24Hours,
      includeHoliday: apiData.includeHoliday || false,
      patternedRecurrence: RecurrenceModel.deserialize(apiData.patternedRecurrence),
      statusId: apiData.statusId,
    };
    return new ScheduleModel(data);
  }

  // serialize object for create/update API
  public serialize(sourceTypeId: number, accessLevelId: number, statusId: number): IAPISchedule {
    return {
      id: this.id || 0,
      scheduleTypeId: this.scheduleType?.id || this.scheduleTypeId,
      sourceTypeId,
      accessLevelId,
      statusId,
      ...this.getRequestObject(),
    };
  }

  // serialize object for create/update API
  public serializeEvent(
    eventScheduleId: number,
    sourceTypeId: number,
    accessLevelId: number,
    statusId: number
  ): IAPIEventSchedule {
    return {
      ...this.serialize(sourceTypeId, accessLevelId, statusId),
      id: eventScheduleId || 0,
      eventScheduleTypeId: this.scheduleType?.id,
      startDate: this.startDate || null,
      endDate: this.endDate || null,
      isAllDay: this.is24Hours || false,
      startTime: this.startTime?.time || null,
      endTime: this.endTime?.time || null,
      // not required for event
      is24Hours: undefined,
      scheduleTypeId: undefined,
      patternedRecurrence: this.isRecurring ? this.patternedRecurrence.serialize(this.stddstType?.id, true) : null,
    };
  }

  private getRequestObject(): Partial<IAPISchedule> {
    switch (this.scheduleType?.id) {
      case SCHEDULE_TYPE.RECURRENCE:
        return {
          startDate: this.startDate || null,
          endDate: this.endDate || null,
          startTime: this.startTime?.serialize(),
          endTime: this.endTime?.serialize(),
          durationInMinutes: this.durationInMinutes || 0,
          timeTypeId: this.timeType?.id,
          is24Hours: this.is24Hours,
          includeHoliday: this.includeHoliday,
          stddstTypeId: this.stddstType?.id,
          patternedRecurrence: this.patternedRecurrence.serialize(this.stddstType?.id),
        };
      case SCHEDULE_TYPE.CONTINUES:
        return {
          timeTypeId: this.timeType?.id,
          startDate: this.startDate || null,
          endDate: this.endDate || null,
          startTime: this.startTime?.serialize(),
          endTime: this.endTime?.serialize(),
        };
      default:
        return null;
    }
  }

  // Validate Data
  public get isDataValid(): boolean {
    const { recurrenceRangeType, numberOfOccurrences, endDate, startDate } = this.patternedRecurrence.recurrenceRange;

    if (!startDate) {
      return false;
    }
    switch (this.scheduleType?.id) {
      case SCHEDULE_TYPE.RECURRENCE:
        if (
          !recurrenceRangeType ||
          (recurrenceRangeType.id === RECURRENCE_RANGE_TYPE.NUMBERED && !numberOfOccurrences) ||
          (recurrenceRangeType.id === RECURRENCE_RANGE_TYPE.END_DATE && !endDate)
        ) {
          return false;
        }
        if (this.startTime?.time && this.endTime?.time) {
          const isValidTime = Utilities.compareDateTime(
            Utilities.getformattedDate(this.startTime.time, DATE_FORMAT.APPOINTMENT_TIME),
            Utilities.getformattedDate(this.endTime.time, DATE_FORMAT.APPOINTMENT_TIME),
            DATE_FORMAT.APPOINTMENT_TIME
          );
          if (!isValidTime) {
            return false;
          }
        }

        const { interval, daysOfWeeks, weekIndexId, firstDayOfWeekId, dayOfMonth, recurrencePatternTypeId, month } =
          this.patternedRecurrence.recurrencePattern;
        switch (recurrencePatternTypeId) {
          case RECURRENCE_PATTERN_TYPE.DAILY:
            return Boolean(interval);
          case RECURRENCE_PATTERN_TYPE.WEEKLY:
            return Boolean(interval && daysOfWeeks.length);
          case RECURRENCE_PATTERN_TYPE.MONTHLY:
            return Boolean(interval && dayOfMonth);
          case RECURRENCE_PATTERN_TYPE.RELATIVE_MONTHLY:
            return Boolean(interval && weekIndexId && firstDayOfWeekId);
          case RECURRENCE_PATTERN_TYPE.YEARLY:
            return Boolean(interval && month && dayOfMonth);
          case RECURRENCE_PATTERN_TYPE.RELATIVE_YEARLY:
            return Boolean(interval && month && weekIndexId && firstDayOfWeekId);
        }
      case SCHEDULE_TYPE.CONTINUES:
        return Boolean(this.startDate && this.startTime?.time && this.endDate && this.endTime?.time);
      default:
        return true;
    }
  }
}
