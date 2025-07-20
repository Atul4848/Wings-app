import { RECURRENCE_PATTERN_TYPE } from '../Enums';
import { IAPIRecurrencePattern } from '../Interfaces';
import { DayOfWeekModel } from './DayOfWeek.model';
import { CoreModel, modelProtection, Utilities } from '@wings-shared/core';

@modelProtection
export class RecurrencePatternModel extends CoreModel {
  recurrencePatternTypeId: RECURRENCE_PATTERN_TYPE = RECURRENCE_PATTERN_TYPE.WEEKLY;
  patternedRecurrenceId: number = 0;
  interval: number = 1;
  month?: number = null;
  dayOfMonth?: number = null;
  daysOfWeeks?: DayOfWeekModel[] = [];
  firstDayOfWeekId?: number = null;
  weekIndexId?: number = null;

  constructor(params?: Partial<RecurrencePatternModel>) {
    super(params);
    Object.assign(this, params);
  }

  static deserialize(apiData: IAPIRecurrencePattern): RecurrencePatternModel {
    if (!apiData) {
      return new RecurrencePatternModel();
    }

    const data: Partial<RecurrencePatternModel> = {
      id: apiData.id,
      recurrencePatternTypeId: apiData.recurrencePatternType?.recurrencePatternTypeId,
      interval: apiData.interval,
      patternedRecurrenceId: apiData.patternedRecurrenceId,
      month: apiData.month,
      dayOfMonth: apiData.dayOfMonth,
      daysOfWeeks: DayOfWeekModel.deserializeList(apiData.daysOfWeeks),
      firstDayOfWeekId: apiData.firstDayOfWeekId,
      weekIndexId: apiData.weekIndexId,
      statusId: apiData.statusId,
    };
    return new RecurrencePatternModel(data);
  }

  // serialize object for create/update API
  public serialize(allowMonthlyYearly?: boolean): IAPIRecurrencePattern {
    const recurrencePatternTypeId = allowMonthlyYearly ? this.recurrencePatternTypeId : this._recurrencePatternTypeId;
    return {
      id: this.id || 0,
      recurrencePatternTypeId,
      interval: Utilities.getNumberOrNullValue(this.interval),
      patternedRecurrenceId: this.patternedRecurrenceId,
      month: Utilities.getNumberOrNullValue(this.month),
      dayOfMonth: Utilities.getNumberOrNullValue(this.dayOfMonth),
      daysOfWeeks: Utilities.isEqual(RECURRENCE_PATTERN_TYPE.WEEKLY, recurrencePatternTypeId) ? this.daysOfWeeks : [],
      firstDayOfWeekId: Utilities.getNumberOrNullValue(this.firstDayOfWeekId),
      weekIndexId: this.weekIndexId || null,
      statusId: this.statusId,
    };
  }

  get recurrencePatternType(): RECURRENCE_PATTERN_TYPE {
    const { MONTHLY, YEARLY } = RECURRENCE_PATTERN_TYPE;

    switch (this.recurrencePatternTypeId) {
      case RECURRENCE_PATTERN_TYPE.MONTHLY:
      case RECURRENCE_PATTERN_TYPE.RELATIVE_MONTHLY:
        return MONTHLY;
      case RECURRENCE_PATTERN_TYPE.YEARLY:
      case RECURRENCE_PATTERN_TYPE.RELATIVE_YEARLY:
        return YEARLY;
      default:
        return this.recurrencePatternTypeId;
    }
  }

  public get _recurrencePatternTypeId(): RECURRENCE_PATTERN_TYPE {
    return this.daysOfWeeks.length && this.daysOfWeeks.length <= 6
      ? RECURRENCE_PATTERN_TYPE.WEEKLY
      : RECURRENCE_PATTERN_TYPE.DAILY;
  }
}
