import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIPatternedRecurrence } from '../Interfaces/Response/API-Response-VendorLocation';
import { SettingBaseModel } from './SettingBase.model';
import { PatternedRecurrenceDaysofWeek } from './PatternedRecurrenceDaysofWeek.model';

@modelProtection
export class PatternedRecurrence extends CoreModel {
  id: number = 0;
  scheduleId: number = 0;
  patternedRecurrenceType: SettingBaseModel = new SettingBaseModel();
  patternedRecurrenceDaysofWeek?: PatternedRecurrenceDaysofWeek[] = [];

  constructor(data?: Partial<PatternedRecurrence>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIPatternedRecurrence): PatternedRecurrence {
    if (!apiData) {
      return new PatternedRecurrence();
    }
    const data: Partial<PatternedRecurrence> = {
      ...apiData,
      scheduleId: apiData.scheduleId,
      patternedRecurrenceType: SettingBaseModel.deserialize(apiData.patternedRecurrenceType),
      patternedRecurrenceDaysofWeek: PatternedRecurrenceDaysofWeek.deserializeList(
        apiData.patternedRecurrenceDaysofWeek || apiData.patternedRecurrenceDaysofWeekResponse
      ),
    };
    return new PatternedRecurrence(data);
  }

  static deserializeList(apiDataList: IAPIPatternedRecurrence[]): PatternedRecurrence[] {
    return apiDataList ? apiDataList.map((apiData: any) => PatternedRecurrence.deserialize(apiData)) : [];
  }

  public serialize() {
    return {
      id: this.id || this.scheduleId || 0,
      patternedRecurrenceDaysofWeekRequest: this.patternedRecurrenceDaysofWeek,
    };
  }
  // required in auto complete
  public get label(): string {
    return `${this.id}`;
  }

  public get value(): string | number {
    return this.id;
  }
}
