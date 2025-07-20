import { IAPIStagingAirportRegion } from '../Interfaces/API-airport-location.interface';
import { CoreModel, SettingsTypeModel } from '@wings-shared/core';

export class StagingAirportTimezoneModel extends CoreModel {
  timeZoneId: number;
  currentZoneName: string;
  currentZoneAbbreviation: string;
  year: number;
  currentOffset: string;
  zoneTotalOffsetInSeconds: number;
  currentZoneStart: string;
  airportId: number;
  airportCode: string;
  airportName: string;
  timezoneRegionId: number;
  latitudeDegrees: number;
  longitudeDegrees: number;
  stagingStatusId: number;
  stagingStatusName: string;
  timeZoneRegion: SettingsTypeModel;

  constructor(data?: Partial<StagingAirportTimezoneModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiAirport: IAPIStagingAirportRegion): StagingAirportTimezoneModel {
    if (!apiAirport) {
      return new StagingAirportTimezoneModel();
    }
    return new StagingAirportTimezoneModel({
      ...CoreModel.deserializeAuditFields(apiAirport),
      ...apiAirport,
      id: apiAirport.id || apiAirport.stagingAirportRegionId,
      timeZoneRegion: new SettingsTypeModel({
        id: apiAirport.timezoneRegionId,
        name: apiAirport.timezoneRegionName,
      }),
    });
  }

  static deserializeList(apiDataList: IAPIStagingAirportRegion[]): StagingAirportTimezoneModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIStagingAirportRegion) => StagingAirportTimezoneModel.deserialize(apiData))
      : [];
  }
}
