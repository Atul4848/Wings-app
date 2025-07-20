import { CoreModel } from '@wings-shared/core';
import { IAPITimeZoneDetails } from '../../../Shared/Interfaces/API-time-zone-details.interface';

export class TimeZoneDetailsModel extends CoreModel {
  isException: boolean = false;
  isCustomTimeZone: boolean = false;
  currentZoneName: string = '';
  currentZoneAbbreviation: string = '';
  currentGmtOffset: string = '';
  currentZoneStart: string = '';
  currentZoneEnd: string = '';
  nextZoneName: string = '';
  nextZoneAbbreviation: string = '';
  nextGmtOffset: string = '';
  nextZoneStart: string = '';
  nextZoneEnd: string = '';
  icao: string = '';
  iata: string = '';
  faaCode: string = '';
  city?: string = '';
  country?: string = '';
  countryId?: number = null;
  countryCode?: string = '';
  latitudeDegrees?: string = '';
  longitudeDegrees?: string = '';
  timeZoneIds: number[] = [];
  locationId?: number = null;

  constructor(data?: Partial<TimeZoneDetailsModel>) {
    super(data);
    Object.assign(this, data);

  }

  static deserialize(apiTimeZone: IAPITimeZoneDetails): TimeZoneDetailsModel {
    if (!apiTimeZone) {
      return new TimeZoneDetailsModel();
    }

    const data: Partial<TimeZoneDetailsModel> = {
      isException: apiTimeZone.isException,
      isCustomTimeZone: apiTimeZone.isCustomTimeZone,
      icao: apiTimeZone.icao,
      iata: apiTimeZone.iata,
      faaCode: apiTimeZone.faaCode,
      currentZoneName: apiTimeZone.currentZoneName,
      currentZoneAbbreviation: apiTimeZone.currentZoneAbbreviation,
      currentGmtOffset: apiTimeZone.currentGmtOffset,
      currentZoneStart: apiTimeZone.currentZoneStart,
      currentZoneEnd: apiTimeZone.currentZoneEnd,
      nextZoneName: apiTimeZone.nextZoneName,
      nextZoneAbbreviation: apiTimeZone.nextZoneAbbreviation,
      nextGmtOffset: apiTimeZone.nextGmtOffset,
      nextZoneStart: apiTimeZone.nextZoneStart,
      nextZoneEnd: apiTimeZone.nextZoneEnd,
      latitudeDegrees: apiTimeZone.latitudeDegrees,
      longitudeDegrees: apiTimeZone.longitudeDegrees,
      timeZoneIds: apiTimeZone.timeZoneIds,
    };
    return new TimeZoneDetailsModel(data);
  }

  static deserializeList(apiDataList: IAPITimeZoneDetails[]): TimeZoneDetailsModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPITimeZoneDetails) => TimeZoneDetailsModel.deserialize(apiData))
      : [];
  }
}
