import { LocationModel, TimeZoneRegionModel } from '../Models';
import { IAPIAirportLocation } from '../Interfaces/API-airport-location.interface';
import { AccessLevelModel, CoreModel, SourceTypeModel, StatusTypeModel } from '@wings-shared/core';
import { IAPITimeZoneRegion } from '../Interfaces';
import { AirportModel, IAPIAirport } from '@wings/shared';

export class AirportLocationModel extends CoreModel {
  airport: AirportModel;
  iata: string;
  locationId?: number;
  locationName?: string;
  latitudeDegrees: number;
  longitudeDegrees: number;
  timeZoneRegionId: number;
  timezoneRegion: TimeZoneRegionModel;

  airportLocationId: number;
  currentZoneName: string;
  currentZoneAbbreviation: string;
  year: number;
  currentOffset: string;
  zoneTotalOffsetInSeconds: number;
  currentZoneStart: string;

  // extra fields for view model
  error?: string;
  locations?: LocationModel;
  localTime: string;
  zuluTime: string;

  constructor(data?: Partial<AirportLocationModel>) {
    super(data);
    Object.assign(this, data);
    this.locations = new LocationModel(data?.locations);
    this.airport = new AirportModel(data?.airport);
    this.status = new StatusTypeModel(data?.status);
    this.accessLevel = new AccessLevelModel(data?.accessLevel);
    this.sourceType = data?.sourceType ? new SourceTypeModel(data?.sourceType) : null;
  }

  static deserialize(apiAirport: IAPIAirportLocation): AirportLocationModel {
    if (!apiAirport) {
      return new AirportLocationModel();
    }

    const timezoneRegion = apiAirport.timezoneRegion
      ? apiAirport.timezoneRegion
      : {
        id: apiAirport.timezoneRegionId,
        regionName: apiAirport.timezoneRegionName,
        timezoneName: apiAirport.currentZoneName,
      };

    return new AirportLocationModel({
      ...CoreModel.deserializeAuditFields(apiAirport),
      ...apiAirport,
      airport: AirportModel.deserialize({
        id: apiAirport.airportId,
        uwaCode: apiAirport.airportCode,
        name: apiAirport.name,
      } as IAPIAirport),
      timezoneRegion: TimeZoneRegionModel.deserialize(timezoneRegion as IAPITimeZoneRegion),
      sourceType: SourceTypeModel.deserialize(apiAirport.sourceType),
    });
  }

  static deserializeList(apiList: IAPIAirportLocation[]): AirportLocationModel[] {
    return apiList ? apiList.map(data => AirportLocationModel.deserialize(data)) : [];
  }

  public serialize(): Partial<IAPIAirportLocation> {
    return {
      id: this.id,
      airportId: this.airport?.id,
      airportCode: this.airport?.icaoOrUwaCode,
      name: this.airport?.name,
      longitudeDegrees: this.longitudeDegrees || 0,
      latitudeDegrees: this.latitudeDegrees || 0,
      timezoneRegionId: this.timezoneRegion?.id,
      ...this._serialize(),
    };
  }
}
