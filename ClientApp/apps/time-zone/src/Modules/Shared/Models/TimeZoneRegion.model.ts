import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPITimeZoneRegion } from '../Interfaces';

@modelProtection
export class TimeZoneRegionModel extends CoreModel {
  timezoneName: string;
  regionName: string;
  countryCode: string;
  countryName: string;
  description: string;
  noDst: boolean;
  reason: string;

  constructor(data?: Partial<TimeZoneRegionModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiTimezoneRegion: IAPITimeZoneRegion): TimeZoneRegionModel {
    if (!apiTimezoneRegion) {
      return new TimeZoneRegionModel();
    }

    const data: Partial<TimeZoneRegionModel> = {
      ...CoreModel.deserializeAuditFields(apiTimezoneRegion),
      ...apiTimezoneRegion,
    };

    return new TimeZoneRegionModel(data);
  }

  static deserializeList(apiTimezoneRegionList: IAPITimeZoneRegion[]): TimeZoneRegionModel[] {
    return apiTimezoneRegionList
      ? apiTimezoneRegionList.map((apiTimezoneRegion: IAPITimeZoneRegion) =>
        TimeZoneRegionModel.deserialize(apiTimezoneRegion)
      )
      : [];
  }

  // Need for AutoComplete
  public get label(): string {
    return this.timezoneName && this.regionName ? `${this.timezoneName} (${this.regionName})` : this.regionName;
  }

  public get value(): string | number {
    return this.id;
  }
}
