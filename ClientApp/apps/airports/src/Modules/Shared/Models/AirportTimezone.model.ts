import { IAPIAirportTimezone, ICurrentTimeZone } from '../Interfaces';
import { AirportTimeZoneInformationModel } from './AirportTimeZoneInformation.model';

export class AirportTimezoneModel {
  // User Local TimeZone
  local = new AirportTimeZoneInformationModel();
  // Airport Current Time
  currentTime = new AirportTimeZoneInformationModel();
  // when DST off
  sdt = new AirportTimeZoneInformationModel();
  // when DST on
  dst = new AirportTimeZoneInformationModel();

  hasDst: boolean = false;

  constructor(data?: Partial<AirportTimezoneModel>) {
    Object.assign(this, data);
  }

  public static getOffsetInMinutes(offset: string) {
    const _offset = offset.split(':');
    const hours = Number(_offset[0]);
    const minutes = Math.abs(hours) * 60 + Number(_offset[1]);
    return hours >= 0 ? minutes : -minutes;
  }

  public static deserialize(apiData?: ICurrentTimeZone): AirportTimezoneModel {
    if (!apiData) {
      return new AirportTimezoneModel();
    }

    // IF zoneDst==0 then it mean it's a STANDARD Time else it's a DST Time
    const currentTime = AirportTimeZoneInformationModel.deserialize({
      zoneAbbreviation: apiData.currentZoneAbbreviation,
      offset: apiData.curZoneOffset,
      zoneDiff: apiData.curTimeZoneDiff,
      startDate: apiData.curTimeZoneBeginDate,
      endDate: apiData.curTimeZoneEndDate,
      startTime: apiData.curTimeZoneBeginTime,
      endTime: apiData.curTimeZoneEndTime,
      zoneDST: apiData.curZoneDST,
    });

    const nextTime = AirportTimeZoneInformationModel.deserialize({
      zoneAbbreviation: apiData.nextZoneAbbreviation,
      offset: apiData.nextZoneOffset,
      zoneDiff: apiData.nextTimeZoneDiff,
      startDate: apiData.nextTimeZoneBeginDate,
      endDate: apiData.nextTimeZoneEndDate,
      startTime: apiData.nextTimeZoneBeginTime,
      endTime: apiData.nextTimeZoneEndTime,
      zoneDST: apiData.nextZoneDST,
    });

    return new AirportTimezoneModel({
      currentTime,
      hasDst: Boolean(currentTime.zoneDST) || Boolean(nextTime.zoneDST),
      local: AirportTimeZoneInformationModel.deserialize(),
      sdt: currentTime.zoneDST === 0 ? currentTime : nextTime,
      dst: currentTime.zoneDST === 0 ? nextTime : currentTime,
    });
  }
}
