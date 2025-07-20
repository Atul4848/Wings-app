import { DATE_FORMAT, Utilities } from '@wings-shared/core';
import moment from 'moment';
import { TIME_TYPE } from '../Enums';

export class AirportTimeZoneInformationModel {
  // title: string = '';
  zoneName: string = '';
  zoneAbbreviation: string = '';
  // offset in minutes
  offset: number = 0;
  // difference between two zones +0.5:30
  zoneDiff: string = '';
  startDate: string = '';
  endDate: string = '';
  startTime: string = '';
  endTime: string = '';
  startMessage: string = '';
  timeType: TIME_TYPE = TIME_TYPE.LOCAL;
  zoneDST: number = 0;

  constructor(params?: Partial<AirportTimeZoneInformationModel>) {
    Object.assign(this, params);
  }

  public get hasStartEndTimeAvailable() {
    return Boolean(this.startDate);
  }

  public static deserialize(timezone?: Partial<AirportTimeZoneInformationModel>): AirportTimeZoneInformationModel {
    if (!timezone) {
      const _moment = moment();
      return new AirportTimeZoneInformationModel({
        zoneDiff: _moment.format('Z'),
        zoneAbbreviation: _moment.zoneAbbr(),
        zoneName: _moment.zoneName(),
      });
    }

    const getDateTime = (date, isTime = false) => {
      const format = isTime ? DATE_FORMAT.SDT_DST_TIME_FORMAT : DATE_FORMAT.DATE_PICKER_FORMAT;
      // 12-03-2023 02:00:00
      const momentDate = moment.utc(date, 'YYYY-MM-DD HH:mm:ss');
      return momentDate.isValid() ? momentDate.format(format) : '';
    };

    return new AirportTimeZoneInformationModel({
      timeType: timezone.zoneDST === 0 ? TIME_TYPE.STD : TIME_TYPE.DST,
      zoneDiff: timezone.zoneDiff,
      zoneAbbreviation: timezone.zoneAbbreviation,
      zoneName: timezone.zoneName,
      zoneDST: Number(timezone.zoneDST),
      startDate: getDateTime(timezone.startDate).toUpperCase(),
      startTime: getDateTime(timezone.startTime, true),
      endDate: getDateTime(timezone.endDate).toUpperCase(),
      endTime: getDateTime(timezone.endTime, true),
    });
  }
}
