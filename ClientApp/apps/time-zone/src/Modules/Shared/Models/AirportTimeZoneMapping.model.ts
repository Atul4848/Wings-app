import {
  AccessLevelModel,
  CoreModel,
  EntityMapModel,
  SettingsTypeModel,
  SourceTypeModel,
  StatusTypeModel,
  Utilities,
} from '@wings-shared/core';
import { IAPIAirportTimeZoneMapping } from '../Interfaces/API-timezone-mapping.interface';
import { TimeZoneRegionModel } from './TimeZoneRegion.model';
import { IAPITimeZoneRegion } from '../Interfaces/API-time-zone.interface';

export class AirportTimeZoneMappingModel extends CoreModel {
  airportId: number;
  airportCode: string;
  airportName: string;
  timezoneRegionId: number;
  timezoneRegionName: string;
  timezoneName:string;
  airportLocation: EntityMapModel;
  timeZoneRegion: TimeZoneRegionModel;

  constructor(data?: Partial<AirportTimeZoneMappingModel>) {
    super(data);
    Object.assign(this, data);
    this.status = new StatusTypeModel(data?.status);
    this.accessLevel = new AccessLevelModel(data?.accessLevel);
    this.sourceType = data?.sourceType ? new SourceTypeModel(data?.sourceType) : null;
  }

  static deserialize(apiAirport: IAPIAirportTimeZoneMapping): AirportTimeZoneMappingModel {
    if (!apiAirport) {
      return new AirportTimeZoneMappingModel();
    }

    const timezoneRegion = 
      {
        id: apiAirport.timezoneRegionId,
        regionName: apiAirport.timezoneRegionName,
        timezoneName: apiAirport.timezoneName,
      };
    return new AirportTimeZoneMappingModel({
      ...apiAirport,
      ...CoreModel.deserializeAuditFields(apiAirport),
      id: apiAirport.id,
      airportCode: apiAirport.airportCode,
      airportName: apiAirport.airportName,
      airportLocation: new EntityMapModel({
        id: apiAirport.airportId,
        name: apiAirport.airportName,
        code: apiAirport.airportCode,
        entityId: apiAirport.airportId,
      }),
      timeZoneRegion: TimeZoneRegionModel.deserialize(timezoneRegion),
    });
  }

  static deserializeList(apiDataList: IAPIAirportTimeZoneMapping[]): AirportTimeZoneMappingModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIAirportTimeZoneMapping) => AirportTimeZoneMappingModel.deserialize(apiData))
      : [];
  }

  // serialize object for create/update API
  public serialize(): IAPIAirportTimeZoneMapping {
    return {
      id: this.id,
      airportId: this.airportLocation.id,
      timezoneRegionId: this.timeZoneRegion.id,
      ...this._serialize(),
    };
  }
}
