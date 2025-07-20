import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import {
  AirportHoursStoreMock,
  AirportHoursSubTypeModel,
  AirportHoursModel,
  AirportSettingsStoreMock,
  AirportHoursTypeModel,
} from '../../Shared';
import { ScheduleModel, HoursTimeModel, SCHEDULE_TYPE } from '@wings-shared/scheduler';
import {
  SettingsTypeModel,
  SourceTypeModel,
  StatusTypeModel,
  AccessLevelModel,
  UIStore,
  IdNameCodeModel,
} from '@wings-shared/core';
import { OtOrHoursDetails } from '../Components';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';
import Sinon from 'sinon';
import { AirportModel } from '@wings/shared';

describe('OtOrHoursDetails V2 Module', function () {
  let wrapper: any;

  const airportHoursModel = new AirportHoursModel({
    id: 1,
    icao: 'test',
    airport: new AirportModel({ id: 1, icao: new IdNameCodeModel({ id: 1, name: 'Test', code: 'Test' }) }),
    airportHoursType: new AirportHoursTypeModel({ id: 1, name: 'operational' }),
    airportHoursSubType: new AirportHoursSubTypeModel({ id: 1 }),
    cappsSequenceId: 1,
    sourceType: new SourceTypeModel({ id: 1 }),
    status: new StatusTypeModel({ id: 1 }),
    accessLevel: new AccessLevelModel({ id: 1 }),
    schedule: new ScheduleModel({
      id: 1,
      scheduleTypeId: SCHEDULE_TYPE.RECURRENCE,
      timeType: new SettingsTypeModel({ id: 1 }),
      startTime: new HoursTimeModel({
        id: 1,
        time: '2021-03-23T13:06:00Z',
        solarTime: new SettingsTypeModel({ id: 1 }),
      }),
      endTime: new HoursTimeModel({
        id: 1,
        time: '2021-03-23T13:40:00Z',
        solarTime: new SettingsTypeModel({ id: 1 }),
      }),
    }),
  });

  const props = {
    airportHoursStore: new AirportHoursStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    airportHoursModel,
    classes: {},
    updateGridItem: (updatedModel: AirportHoursModel[]) => '',
  };

  beforeEach(function () {
    wrapper = shallow(<OtOrHoursDetails {...props} />).dive();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render LinearProgress while loading', () => {
    UIStore.setPageLoader(true);
    wrapper.props().isLoading();
  });

  it('should render Close button as Dialog Action by click should fire ModalStore.close()', () => {
    const caller = Sinon.spy();
    ModalStore.close = caller;
    wrapper.props().onClose();
    expect(caller.calledOnce).to.be.true;
  });

  it('should render Close button of PrimaryButton as Dialog Action by click should fire ModalStore.close()', () => {
    const caller = Sinon.spy();
    ModalStore.close = caller;
    wrapper.dive().find(PrimaryButton).props().onClick();
    expect(caller.calledOnce).to.be.true;
  });

  it('should call the upsert function', () => {
    const mock = Sinon.spy(props.airportHoursStore, 'upsertAirportHours');
    wrapper.dive().find(SecondaryButton).props().onClick();
    expect(mock.calledOnce).true;
  });
});
