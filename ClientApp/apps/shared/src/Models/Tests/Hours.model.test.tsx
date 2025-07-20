import { expect } from 'chai';
import { SettingsTypeModel } from '@wings-shared/core';
import { SUNSET_SUNRISE_TYPE, HoursTimeModel } from '@wings-shared/scheduler';

describe('Hours Time Model', () => {
  it('solarTimeFormatting should return proper string', () => {
    // return time value if no solar value provided
    expect(new HoursTimeModel({ time: '2021-06-09T18:20:00' }).formattedSolarTime).to.eq('18:20');

    // return solar value if provided
    const timeModel = new HoursTimeModel({
      time: '2021-06-09T18:20:00',
      solarTime: new SettingsTypeModel({ id: SUNSET_SUNRISE_TYPE.SUNRISE, name: 'Sunrise' }),
      offSet: 50,
    });
    expect(timeModel.formattedSolarTime).to.eq('Sunrise +50');
  });
});
