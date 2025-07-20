import { HoursTimeModel, ScheduleModel, seunsetSunriseOptions } from '@wings-shared/scheduler';
import { expect } from 'chai';
import { AirportHoursModel, AirportHoursTypeModel, ATSAirportModel } from '../Models';
import { AirportHoursStore } from '../Stores/AirportHours.store';
import moment from 'moment';

describe('AirportHours Store Tests', () => {
  const airportHoursStore = new AirportHoursStore();

  const getTime = (hours: number, mins: number) => moment().hour(hours).minutes(mins).seconds(0).format();
  const formattedTime = (time: string) => moment(time, moment.defaultFormat).format('HH:mm');

  afterEach(() => {
    airportHoursStore.otorAirportHours = [];
  });

  const airportHoursTemplate = (airportHoursType: string, startTime: string, endTime: string): AirportHoursModel => {
    return new AirportHoursModel({
      id: 1,
      isOTORApplicable: true,
      airportHoursType: new AirportHoursTypeModel({ id: 1, name: airportHoursType || 'operational' }),
      schedule: new ScheduleModel({
        id: 1,
        startTime: new HoursTimeModel({ time: startTime, solarTime: seunsetSunriseOptions[0] }),
        endTime: new HoursTimeModel({ time: endTime, solarTime: seunsetSunriseOptions[0] }),
      }),
    });
  };

  it('Should create Proper records based on conditions', () => {
    const airportHours = airportHoursTemplate('Test', '', '');
    airportHoursStore.createOTORHours(airportHours, 1);
    expect(airportHoursStore.otorAirportHours).to.have.length(0);
  });

  it('Should create two OTOR records based on conditions', () => {
    const startTime = getTime(9, 0);
    const endTime = getTime(10, 0);
    const airportHours = airportHoursTemplate(null, startTime, endTime);
    airportHoursStore.createOTORHours(airportHours, 1);
    expect(airportHoursStore.otorAirportHours).to.have.length(2);

    const firstRecord = airportHoursStore.otorAirportHours[0];
    expect(formattedTime(firstRecord.schedule.startTime.time)).to.equals('00:01');
    expect(formattedTime(firstRecord.schedule.endTime.time)).to.equals('08:59');

    const secondRecord = airportHoursStore.otorAirportHours[1];
    expect(formattedTime(secondRecord.schedule.startTime.time)).to.equals('10:01');
    expect(formattedTime(secondRecord.schedule.endTime.time)).to.equals('23:59');
  });

  it('Should create one OTOR record based on conditions', () => {
    const startTime = getTime(8, 0);
    const endTime = getTime(23, 59);
    const airportHours = airportHoursTemplate(null, startTime, endTime);
    airportHoursStore.createOTORHours(airportHours, 1);
    expect(airportHoursStore.otorAirportHours).to.have.length(1);
    const firstRecord = airportHoursStore.otorAirportHours[0];
    expect(formattedTime(firstRecord.schedule.startTime.time)).to.equals('00:01');
    expect(formattedTime(firstRecord.schedule.endTime.time)).to.equals('07:59');
  });

  it('Should clear the store when calling reset', () => {
    airportHoursStore.tfoAirports = [new ATSAirportModel({ id: 1 })];
    airportHoursStore.otorAirportHours = [new AirportHoursModel({ id: 1 })];
    expect(airportHoursStore.tfoAirports).to.have.length(1);
    expect(airportHoursStore.otorAirportHours).to.have.length(1);
    // Reset Store
    airportHoursStore.reset();
    expect(airportHoursStore.tfoAirports).to.have.length(0);
    expect(airportHoursStore.otorAirportHours).to.have.length(0);
  });
});
