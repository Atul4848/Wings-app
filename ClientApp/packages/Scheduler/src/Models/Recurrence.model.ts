import { CoreModel } from '@wings-shared/core';
import { IAPIRecurrence } from '../Interfaces';
import { RecurrencePatternModel } from './RecurrencePattern.model';
import { RecurrenceRangeModel } from './RecurrenceRange.model';

export class RecurrenceModel extends CoreModel {
  scheduleId: number;
  recurrencePattern: RecurrencePatternModel;
  recurrenceRange: RecurrenceRangeModel;

  // needed for world event
  eventScheduleId?: number;

  constructor(params?: Partial<RecurrenceModel>) {
    super(params);
    this.scheduleId = params?.scheduleId || 0;
    this.recurrencePattern = params?.recurrencePattern || new RecurrencePatternModel();
    this.recurrenceRange = params?.recurrenceRange || new RecurrenceRangeModel();
    this.eventScheduleId = params?.eventScheduleId || 0;
  }

  static deserialize(apiData: IAPIRecurrence): RecurrenceModel {
    if (!apiData) {
      return new RecurrenceModel();
    }
    const data: Partial<RecurrenceModel> = {
      id: apiData.id,
      name: apiData.name,
      scheduleId: apiData.scheduleId || apiData.eventScheduleId,
      recurrencePattern: RecurrencePatternModel.deserialize(apiData.recurrencePattern),
      recurrenceRange: RecurrenceRangeModel.deserialize(apiData.recurrenceRange),
      statusId: apiData.statusId,
    };
    return new RecurrenceModel(data);
  }

  // serialize object for create/update API
  /**
   *
   * @param stdDstTypeId
   * @param allowMonthlyYearly Allow to use monthly and yearly type schedule
   * @returns
   */
  public serialize(stdDstTypeId: number, allowMonthlyYearly?: boolean): IAPIRecurrence {
    return {
      id: this.id || 0,
      scheduleId: this.scheduleId,
      recurrencePattern: this.recurrencePattern?.serialize(allowMonthlyYearly),
      recurrenceRange: this.recurrenceRange?.serialize(stdDstTypeId),
      eventScheduleId: this.eventScheduleId || 0, // Only used in events
    };
  }
}
