import { ATSAirportModel } from '../Models';
import { expect } from 'chai';
import { IAPIATSAirport } from '../Interfaces';

describe('AirportModel Tests', () => {
  it('sdtDstMessage Should return proper response for inputs', () => {
    const airportModel = ATSAirportModel.deserialize(null);
    expect(airportModel.utcToSDTMessage).to.be.empty;
    expect(airportModel.utcToDSTMessage).to.be.empty;
  });

  it('Should return SDT message i value provided', () => {
    const airportModel = ATSAirportModel.deserialize({
      name: 'BIG HORN COUNTY',
      icao: 'K00U',
      countryCode: 'US',
      airportId: 10432,
      utcToDaylightSavingsConversion: '-06:00',
      utcDayLightSavingsStart: '2020-03-08T02:00:00Z',
      utcDayLightSavingsEnd: '2020-11-01T02:00:00Z',
      utcToStandardTimeConversion: '-07:00',
      utcStandardTimeStart: '2019-11-03T02:00:00Z',
      utcStandardTimeEnd: '2020-03-08T02:00:00Z',
      inactive: false,
    } as IAPIATSAirport);
    expect(airportModel.utcToDSTMessage).to.be.eq('<strong>08-MAR-20</strong> 0200 <strong>01-NOV-20</strong> 0200');
    expect(airportModel.utcToSDTMessage).to.be.eq('<strong>03-NOV-19</strong> 0200 <strong>08-MAR-20</strong> 0200');
  });
});
