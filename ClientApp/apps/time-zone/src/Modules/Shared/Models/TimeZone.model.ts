import { CoreModel, SettingsTypeModel, TimeZoneBaseModel, Utilities, modelProtection } from '@wings-shared/core';
import { IAPITimeZone } from './../Interfaces';

@modelProtection
export class TimeZoneModel extends CoreModel {
  timeChange?: string = '';
  startDateTime?: string = '';
  endDateTime?: string = '';
  timeZoneRegion: SettingsTypeModel;
  countryName?: string = '';
  timeZoneId: number = 0;
  year: number = 0;
  zoneName: string = '';
  zoneAbbreviation: string = '';
  offset: string = '';
  zoneOffset: number = 0;
  zoneDst: number = 0;
  zoneTotalOffset: number = 0;
  newLocalTime?: string = '';
  oldLocalTime?: string = '';
  utcLocalTime?: string = '';

  constructor(data?: Partial<TimeZoneModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiTimeZone: IAPITimeZone): TimeZoneModel {
    if (!apiTimeZone) {
      return new TimeZoneModel();
    }
    const data: Partial<TimeZoneModel> = {
      ...CoreModel.deserializeAuditFields(apiTimeZone),
      id: apiTimeZone.id || apiTimeZone.timeZoneId,
      timeZoneId: apiTimeZone.timeZoneId,
      year: apiTimeZone.year,
      zoneName: apiTimeZone.zoneName,
      zoneAbbreviation: apiTimeZone.zoneAbbreviation,
      offset: apiTimeZone.offset,
      zoneOffset: apiTimeZone.zoneOffset,
      zoneDst: apiTimeZone.zoneDst,
      zoneTotalOffset: apiTimeZone.zoneTotalOffset,
      newLocalTime: apiTimeZone.newLocalTime,
      oldLocalTime: apiTimeZone.oldLocalTime,
      utcLocalTime: apiTimeZone.utcLocalTime,
      startDateTime: apiTimeZone.startDateTime,
      endDateTime: apiTimeZone.endDateTime,
      countryName: apiTimeZone.countryName,
      timeZoneRegion: new SettingsTypeModel({
        id: apiTimeZone.timezoneRegionId,
        name: apiTimeZone.regionName,
      }),
    };
    return new TimeZoneModel(data);
  }

  public serialize(): TimeZoneModel {
    return {
      statusId: Utilities.getNumberOrNullValue(this.status?.value),
      accessLevelId: Utilities.getNumberOrNullValue(this.accessLevel?.id),
      sourceTypeId: Utilities.getNumberOrNullValue(this.sourceType?.id),
      timeZoneId: this.timeZoneId,
      timezoneRegionId: this.timezoneRegionId || this.timeZoneRegion.id,
      zoneName: this.zoneName,
      zoneAbbreviation: this.zoneAbbreviation,
      year: this.year,
      offset: this.offset,
      zoneOffset: this.zoneOffset,
      zoneDst: this.zoneDst,
      zoneTotalOffset: this.zoneTotalOffset,
      newLocalTime: this.newLocalTime,
      oldLocalTime: this.oldLocalTime,
      utcLocalTime: this.utcLocalTime,
      startDateTime: this.startDateTime || null,
      endDateTime: this.endDateTime || null,
    };
  }

  static deserializeList(apiDataList: IAPITimeZone[]): TimeZoneModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPITimeZone) => TimeZoneModel.deserialize(apiData)) : [];
  }
}
