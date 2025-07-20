import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIStagingTimeZone } from './../Interfaces';
import { TimeZoneRegionModel } from './index';

@modelProtection
export class StagingTimeZoneModel extends CoreModel {
  timeZoneId: number;
  timezoneRegionId: number;
  year: number;
  zoneName: string;
  zoneAbbreviation: string;
  offset: string;
  zoneOffset: number;
  zoneDst: number;
  zoneTotalOffset: number;
  newLocalTime?: string;
  oldLocalTime?: string;
  utcLocalTime?: string;
  timezoneRegion: TimeZoneRegionModel;
  stagingStatusId: number;
  stagingStatusName: string;
  startDateTime?: string = '';
  endDateTime?: string = '';

  constructor(data?: Partial<StagingTimeZoneModel>) {
    super(data);
    Object.assign(this, data);
    this.timezoneRegion = new TimeZoneRegionModel(data?.timezoneRegion);
  }

  static deserialize(apiData: IAPIStagingTimeZone): StagingTimeZoneModel {
    if (!apiData) {
      return new StagingTimeZoneModel();
    }
    const data: Partial<StagingTimeZoneModel> = {
      ...CoreModel.deserializeAuditFields(apiData),
      ...apiData,
      id: apiData.id || apiData.stagingTimeZoneId,
      timezoneRegion: TimeZoneRegionModel.deserialize(apiData.timezoneRegion),
    };
    return new StagingTimeZoneModel(data);
  }

  static deserializeList(apiDataList: IAPIStagingTimeZone[]): StagingTimeZoneModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIStagingTimeZone) => StagingTimeZoneModel.deserialize(apiData))
      : [];
  }
}
