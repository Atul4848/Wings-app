import { IAPITimeZoneBase } from '../Interfaces';
import { modelProtection } from '../Decorators';
import { AccessLevelModel } from './AccessLevel.model';
import { CoreModel } from './Core.model';
import { SourceTypeModel } from './SourceType.model';

@modelProtection
export class TimeZoneBaseModel extends CoreModel {
  timeZoneId: number = 0;
  year: number = null;
  zoneName: string = '';
  zoneAbbreviation: string = '';
  offset: string = '';
  zoneOffset: number = null;
  zoneDst: number = null;
  zoneTotalOffset: number = null;
  newLocalTime?: string = '';
  oldLocalTime?: string = '';
  utcLocalTime?: string = '';
  regionId: number = null;
  regionName: string = '';
  countryId: number = 0;
  countryName: string = '';
  source: string = '';

  constructor(data?: Partial<TimeZoneBaseModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiTimeZone: IAPITimeZoneBase): TimeZoneBaseModel {
    if (!apiTimeZone) {
      return new TimeZoneBaseModel();
    }
    const data: Partial<TimeZoneBaseModel> = {
      id: apiTimeZone.id,
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
      regionId: apiTimeZone.regionId,
      regionName: apiTimeZone.regionName,
      countryId: apiTimeZone.countryId,
      countryName: apiTimeZone.countryName,
      createdBy: apiTimeZone.createdBy,
      modifiedBy: apiTimeZone.modifiedBy,
      createdOn: apiTimeZone.createdOn,
      modifiedOn: apiTimeZone.modifiedOn,
      source: apiTimeZone.source,
      statusId: apiTimeZone.statusId,
      accessLevel: AccessLevelModel.deserialize(apiTimeZone.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiTimeZone.sourceType),
    };
    return new TimeZoneBaseModel(data);
  }

  static deserializeList(apiDataList: IAPITimeZoneBase[]): TimeZoneBaseModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPITimeZoneBase) => TimeZoneBaseModel.deserialize(apiData)) : [];
  }
}
