import { modelProtection } from '@wings-shared/core';
import { IDaysOfWeek } from '../Interfaces';

@modelProtection
export class DayOfWeekModel {
  id: number = 0;
  dayOfWeekId: number = null;
  recurrencePatternId: number = null;

  constructor(data?: Partial<DayOfWeekModel>) {
    Object.assign(this, data);
  }

  static deserialize(apiData: IDaysOfWeek): DayOfWeekModel {
    if (!apiData) {
      return new DayOfWeekModel();
    }

    const data: Partial<DayOfWeekModel> = {
      id: apiData.id,
      recurrencePatternId: apiData.recurrencePatternId,
      dayOfWeekId: apiData.dayOfWeek?.dayOfWeekId,
    };
    return new DayOfWeekModel(data);
  }

  public static deserializeList(apiData: IDaysOfWeek[]): DayOfWeekModel[] {
    return apiData ? apiData.map((dayOfWeek: IDaysOfWeek) => DayOfWeekModel.deserialize(dayOfWeek)) : [];
  }
}
