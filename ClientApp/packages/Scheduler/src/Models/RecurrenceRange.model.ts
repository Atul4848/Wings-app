import { IAPIRecurrenceRange } from '../Interfaces';
import { recurrenceRangeTypeOptions } from '../Components/fields';
import { CoreModel, Utilities, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { RECURRENCE_RANGE_TYPE } from '../Enums';

@modelProtection
export class RecurrenceRangeModel extends CoreModel {
  recurrenceRangeType: SettingsTypeModel = recurrenceRangeTypeOptions[1];
  patternedRecurrenceId: number = 0;
  startDate: string = Utilities.getCurrentDate;
  endDate?: string = null;
  numberOfOccurrences: number = null;

  constructor(data?: Partial<RecurrenceRangeModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIRecurrenceRange): RecurrenceRangeModel {
    if (!apiData) {
      return new RecurrenceRangeModel();
    }
    const { recurrenceRangeTypeId } = apiData.recurrenceRangeType;
    const data: Partial<RecurrenceRangeModel> = {
      id: apiData.id,
      recurrenceRangeType: new SettingsTypeModel({
        id: recurrenceRangeTypeId,
        name: recurrenceRangeTypeOptions[recurrenceRangeTypeId - 1]?.name,
      }),
      patternedRecurrenceId: apiData.patternedRecurrenceId,
      startDate: apiData.startDate,
      endDate: apiData.endDate,
      numberOfOccurrences: Utilities.getNumberOrNullValue(apiData.numberOfOccurrences),
      statusId: apiData.statusId,
    };
    return new RecurrenceRangeModel(data);
  }

  // serialize object for create/update API
  public serialize(stdDstTypeId: number): IAPIRecurrenceRange {
    const isNoEndDate =
      Utilities.isEqual(this.recurrenceRangeType.id, RECURRENCE_RANGE_TYPE.NO_END) ||
      Utilities.isEqual(this.recurrenceRangeType.id, RECURRENCE_RANGE_TYPE.NUMBERED);
    return {
      id: this.id || 0,
      recurrenceRangeTypeId: stdDstTypeId ? recurrenceRangeTypeOptions[1].id : this.recurrenceRangeType.id,
      patternedRecurrenceId: this.patternedRecurrenceId,
      startDate: stdDstTypeId ? null : this.startDate || null,
      endDate: stdDstTypeId || isNoEndDate ? null : this.endDate || null,
      numberOfOccurrences: stdDstTypeId ? 0 : Utilities.getNumberOrNullValue(this.numberOfOccurrences) || 0,
      statusId: this.statusId,
    };
  }
}
