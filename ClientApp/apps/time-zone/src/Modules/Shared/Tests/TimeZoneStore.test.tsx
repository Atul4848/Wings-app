import { TimeZoneStore } from '../Stores';
import { TimeZoneModel } from '../Models';
import { expect } from 'chai';
import moment from 'moment';

describe('TimeZone Store', () => {
  let store: TimeZoneStore;

  beforeEach(() => {
    store = new TimeZoneStore();
  });

  it('convertTime return null if no selected Time Zone Found', () => {
    store.airportTimeZones = [ new TimeZoneModel() ];
    expect(store.convertTime(moment().toISOString())).to.equal(null);
  });

  it('convertTime sets time if years match but newLocalTime is null', () => {
    const offset = 3600 * 2;
    store.airportTimeZones = [
      new TimeZoneModel({ newLocalTime: '2020-12-12T10:00:00', year: 2019, zoneTotalOffset: 3600 }),
      new TimeZoneModel({ newLocalTime: null, year: 2020, zoneTotalOffset: offset })
    ];
    const currentDate = '2020-10-10T12:00:00';
    const formatted = store.convertTime(currentDate);
    expect(formatted.zuluTime.hour()).to.equal(moment(currentDate, moment.ISO_8601).subtract(offset, 'seconds').hour());
    expect(formatted.localTime.hour()).to.equal(moment(currentDate, moment.ISO_8601).add(offset, 'seconds').hour());
  });

  it('convertTime take lowest newLocalTime', () => {
    const offset = 3600;
    store.airportTimeZones = [
      new TimeZoneModel({ newLocalTime: '2020-10-10T10:00:00', year: 2020, zoneTotalOffset: offset }),
      new TimeZoneModel({ newLocalTime: '2020-10-10T15:00:00', year: 2020, zoneTotalOffset: 0 })
    ];
    const currentDate = '2020-10-10T12:00:00';
    const formatted = store.convertTime(currentDate);
    expect(formatted.zuluTime.hour()).to.equal(moment(currentDate, moment.ISO_8601).subtract(offset, 'seconds').hour());
    expect(formatted.localTime.hour()).to.equal(moment(currentDate, moment.ISO_8601).add(offset, 'seconds').hour());
  });
});
