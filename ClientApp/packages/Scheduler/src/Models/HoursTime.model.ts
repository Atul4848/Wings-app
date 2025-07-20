import { SUNSET_SUNRISE_TYPE } from '../Enums';
import { seunsetSunriseOptions } from '../Components/fields';
import { IAPIHoursTime } from '../Interfaces';
import { modelProtection, Utilities, DATE_FORMAT, SettingsTypeModel } from '@wings-shared/core';

@modelProtection
export class HoursTimeModel {
  id: number = 0;
  time: string = '';
  solarTime: SettingsTypeModel = new SettingsTypeModel({ id: SUNSET_SUNRISE_TYPE.NONE, name: 'None' });
  offSet: number;
  constructor(data?: Partial<HoursTimeModel>) {
    Object.assign(this, data);
  }

  get formattedSolarTime(): string {
    if (
      Utilities.isEqual(this.solarTime?.id, SUNSET_SUNRISE_TYPE.SUNRISE) ||
      Utilities.isEqual(this.solarTime?.id, SUNSET_SUNRISE_TYPE.SUNSET)
    ) {
      return `${this.solarTime.label} ${this.offSet > 0 ? `+${this.offSet}` : this.offSet || ''}`;
    }
    return Utilities.getformattedDate(this.time, DATE_FORMAT.API_TIME_FORMAT) || '';
  }

  static deserialize(apiData: IAPIHoursTime): HoursTimeModel {
    if (!apiData) {
      return new HoursTimeModel();
    }

    // TODO: remove 'null' check when changes are done on API
    const solarTimeName = (Utilities.isEqual(apiData.solarTime, 'null') ? 'none' : apiData.solarTime || '')
      .toString()
      .toUpperCase();

    return new HoursTimeModel({
      id: apiData.id,
      offSet: apiData.offSet,
      time: apiData.time,
      solarTime: seunsetSunriseOptions.find(({ id }) => SUNSET_SUNRISE_TYPE[solarTimeName] === id),
    });
  }
  public serialize(): IAPIHoursTime {
    return {
      id: this.id,
      time: this.time || null,
      solarTimeId: this.solarTime?.id,
      offSet: Utilities.getNumberOrNullValue(this.offSet),
    };
  }
}
