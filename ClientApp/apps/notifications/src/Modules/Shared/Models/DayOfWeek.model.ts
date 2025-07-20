import { ISelectOption, IdNameModel } from '@wings-shared/core';
import { DAYS_OF_WEEK } from '../Enums';

export class DayOfWeekModel extends IdNameModel<DAYS_OF_WEEK> implements ISelectOption {
  constructor(data?: Partial<DayOfWeekModel>) {
    super();
    Object.assign(this, data);
    this.id = data?.id || DAYS_OF_WEEK.SUNDAY;
    this.name = data?.name || DAYS_OF_WEEK.SUNDAY;
  }

  static deserialize(dayOfWeek: DAYS_OF_WEEK): DayOfWeekModel {
    if (!dayOfWeek) {
      return new DayOfWeekModel();
    }
    const data: Partial<DayOfWeekModel> = {
      id: dayOfWeek,
      name: dayOfWeek,
    };

    return new DayOfWeekModel(data);
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string {
    return this.id;
  }
}
