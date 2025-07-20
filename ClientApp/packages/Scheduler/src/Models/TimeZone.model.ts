import { IAPITimeZone } from '../Interfaces';
import { ISelectOption, modelProtection } from '@wings-shared/core';

@modelProtection
export class TimeZoneModel implements ISelectOption {
  timeZoneId: number = null;
  zoneName: string = '';

  constructor(data?: Partial<TimeZoneModel>) {
    Object.assign(this, data);
  }

  static deserialize(apiTimeZone: IAPITimeZone): TimeZoneModel {
    if (!apiTimeZone) {
      return new TimeZoneModel();
    }
    const data: Partial<TimeZoneModel> = {
      timeZoneId: apiTimeZone.timeZoneId,
      zoneName: apiTimeZone.zoneName,
    };
    return new TimeZoneModel(data);
  }

  static deserializeList(apiDataList: IAPITimeZone[]): TimeZoneModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPITimeZone) => TimeZoneModel.deserialize(apiData)) : [];
  }

  // we need value and label getters for Autocomplete
  public get label(): string {
    return this.zoneName;
  }
  public get value(): string | number {
    return this.timeZoneId;
  }
}
