import { TimeZoneDetailStore } from '../Stores';
import { AirportLocationModel, TimeZoneModel } from '../Models';
import { expect } from 'chai';

describe('TimeZoneDetail Store', () => {
  let store: TimeZoneDetailStore;

  beforeEach(() => {
    store = new TimeZoneDetailStore();
  });

  it('should return No time change yet if only one timezone is available', () => {
    store.timeZones = [new TimeZoneModel()];

    store.setFilteredTimeZones();
    expect(store.filteredTimeZones).to.have.length(1);
    expect(store.filteredTimeZones[0].timeChange).to.equal('No time change yet');
  });

  it('should return time change value in hours', () => {
    store.timeZones = [
      new TimeZoneModel({ year: 2021, oldLocalTime: '2021-11-07T02:00:00', zoneTotalOffset: -14400 }),
      new TimeZoneModel({ year: 2023, oldLocalTime: '2023-11-05T02:00:00', zoneTotalOffset: -18000 }),
      new TimeZoneModel({ year: 2020, oldLocalTime: '2020-11-01T02:00:00', zoneTotalOffset: -18000 }),
      new TimeZoneModel({ year: 2020, oldLocalTime: '2020-03-08T02:00:00', zoneTotalOffset: -14400 }),
      new TimeZoneModel({ year: 2021, zoneTotalOffset: null }),
    ];

    store.setFilteredTimeZones();
    expect(store.filteredTimeZones).to.have.length(5);
    expect(store.filteredTimeZones[0].timeChange).to.equal('-1 hour (DST end)');
  });

  it('setLocalZuluTime set correct localTime and zuluTime', () => {
    // case without locations provided
    const emptyLocations: AirportLocationModel[] = store.setAirportTimeZones(null);
    expect(emptyLocations).to.have.length(0);

    // case with locations provided
    const locations: AirportLocationModel[] = store.setAirportTimeZones([
      new AirportLocationModel({ zoneTotalOffsetInSeconds: 10000 }),
      new AirportLocationModel({ zoneTotalOffsetInSeconds: 5000 }),
    ]);

    expect(locations[0].localTime).to.not.undefined;
    expect(locations[0].zuluTime).to.not.undefined;

    expect(locations[1].localTime).to.not.undefined;
    expect(locations[1].zuluTime).to.not.undefined;
  });
});
