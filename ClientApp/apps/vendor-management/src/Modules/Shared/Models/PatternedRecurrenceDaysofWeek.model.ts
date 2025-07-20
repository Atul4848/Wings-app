import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIDaysOfWeekResponse } from '../Interfaces/Response/API-Response-VendorLocation';
import { SettingBaseModel } from './SettingBase.model';

@modelProtection
export class PatternedRecurrenceDaysofWeek extends CoreModel {
  id: number = 0;
  patternedRecurrenceId: number = 0;
  dayOfWeekId: number = 0;
  dayOfWeek: SettingBaseModel = new SettingBaseModel();

  constructor(data?: Partial<PatternedRecurrenceDaysofWeek>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIDaysOfWeekResponse): PatternedRecurrenceDaysofWeek {
    if (!apiData) {
      return new PatternedRecurrenceDaysofWeek();
    }
    const data: Partial<PatternedRecurrenceDaysofWeek> = {
      ...apiData,
      id: apiData.id,
      patternedRecurrenceId: apiData.patternedRecurrenceId,
      dayOfWeekId: apiData.dayOfWeek?.id,
      dayOfWeek: SettingBaseModel.deserialize(apiData.dayOfWeek),
    };
    return new PatternedRecurrenceDaysofWeek(data);
  }

  static deserializeList(apiDataList: IAPIDaysOfWeekResponse[]): PatternedRecurrenceDaysofWeek[] {
    return apiDataList ? apiDataList.map((apiData: any) => PatternedRecurrenceDaysofWeek.deserialize(apiData)) : [];
  }

  public serialize() {
    return {
      id: this.id || 0,
    };
  }
  // required in auto complete
  public get label(): string {
    return `${this.dayOfWeek.name}`;
  }

  public get value(): string | number {
    return this.id;
  }
}
