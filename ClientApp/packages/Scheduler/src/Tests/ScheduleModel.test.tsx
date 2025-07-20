import { expect } from 'chai';
import { SettingsTypeModel } from '@wings-shared/core';
import { RECURRENCE_PATTERN_TYPE, RECURRENCE_RANGE_TYPE, SCHEDULE_TYPE } from '../Enums';
import { DayOfWeekModel, RecurrenceModel, RecurrencePatternModel, RecurrenceRangeModel, ScheduleModel } from '../Models';

// return any as we need to test private methods
function scheduleInstance(
  interval: number,
  recurrencePatternTypeId: RECURRENCE_PATTERN_TYPE,
  recurrencePatternData?: RecurrencePatternModel,
  recurrenceRangeData?: RecurrenceRangeModel
): any {
  const recurrencePattern = new RecurrencePatternModel({
    interval,
    month: 1,
    dayOfMonth: 1,
    weekIndexId: 1,
    firstDayOfWeekId: 1,
    daysOfWeeks: [new DayOfWeekModel({ dayOfWeekId: 4 })],
    ...recurrencePatternData,
    recurrencePatternTypeId,
  });
  const recurrenceRange = new RecurrenceRangeModel({
    recurrenceRangeType: new SettingsTypeModel({ id: RECURRENCE_RANGE_TYPE.NO_END }),
    ...recurrenceRangeData,
  });

  const patternedRecurrence = new RecurrenceModel({ recurrencePattern, recurrenceRange });
  return new ScheduleModel({
    scheduleTypeId: SCHEDULE_TYPE.RECURRENCE,
    patternedRecurrence,
  });
}

describe('ScheduleModel', () => {
  it('should return proper validation with isDataValid', () => {
    const recurrenceRange = new RecurrenceRangeModel({
      recurrenceRangeType: new SettingsTypeModel({ id: RECURRENCE_RANGE_TYPE.NUMBERED }),
      numberOfOccurrences: 0,
    });
    const instance = scheduleInstance(1, RECURRENCE_PATTERN_TYPE.DAILY, null, recurrenceRange);
    expect(instance.isDataValid).to.be.false;
  });

  it('should return proper validation for WEEKLY view', () => {
    const recurrencePattern = new RecurrencePatternModel({
      interval: 1,
      daysOfWeeks: [new DayOfWeekModel({ id: 1 }), new DayOfWeekModel({ id: 1 })],
    });
    const instance = scheduleInstance(1, RECURRENCE_PATTERN_TYPE.WEEKLY, recurrencePattern);
    expect(instance.isDataValid).to.be.true;
  });

  it('should return proper validation for MONTHLY view', () => {
    const recurrencePattern = new RecurrencePatternModel({
      interval: 1,
      dayOfMonth: 20,
    });
    const instance = scheduleInstance(1, RECURRENCE_PATTERN_TYPE.MONTHLY, recurrencePattern);
    expect(instance.isDataValid).to.be.true;
  });

  it('should return proper validation for RELATIVE_MONTHLY view', () => {
    const recurrencePattern = new RecurrencePatternModel({
      interval: 1,
      weekIndexId: 2,
      firstDayOfWeekId: 2,
    });
    const instance = scheduleInstance(1, RECURRENCE_PATTERN_TYPE.RELATIVE_MONTHLY, recurrencePattern);
    expect(instance.isDataValid).to.be.true;
  });

  it('should return proper validation for YEARLY view', () => {
    const recurrencePattern = new RecurrencePatternModel({
      interval: 1,
      month: 2,
      dayOfMonth: 1,
    });
    const instance = scheduleInstance(1, RECURRENCE_PATTERN_TYPE.YEARLY, recurrencePattern);
    expect(instance.isDataValid).to.be.true;
  });

  it('should return proper validation for RELATIVE_YEARLY view', () => {
    const recurrencePattern = new RecurrencePatternModel({
      interval: 1,
      month: 2,
      weekIndexId: 1,
      firstDayOfWeekId: 2,
    });
    const instance = scheduleInstance(1, RECURRENCE_PATTERN_TYPE.RELATIVE_YEARLY, recurrencePattern);
    expect(instance.isDataValid).to.be.true;
  });
});
