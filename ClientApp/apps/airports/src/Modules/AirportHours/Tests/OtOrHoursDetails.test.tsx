import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import {
  AirportHoursStoreMock,
  AirportHoursSubTypeModel,
  ATSAirportModel,
  AirportHoursModel,
  AirportSettingsStoreMock,
  AirportHoursTypeModel,
} from '../../Shared';
import { ScheduleModel, HoursTimeModel, SCHEDULE_TYPE } from '@wings-shared/scheduler';
import { SettingsTypeModel, UIStore, SourceTypeModel, StatusTypeModel, AccessLevelModel } from '@wings-shared/core';
import OtOrHoursDetails from '../Components/AirportHoursDetails/OtOrHoursDetails/OtOrHoursDetails';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AirportHoursGrid } from '../Components';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';
import { IconButton, LinearProgress } from '@material-ui/core';

describe('OtOrHoursDetails Module', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: ShallowWrapper;
  let dialogActions: ShallowWrapper;
  let dialogTitle: ShallowWrapper;

  const airportHoursModel = new AirportHoursModel({
    id: 1,
    icao: 'test',
    airport: new ATSAirportModel({ id: 1, icao: 'test' }),
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
    isOTORRecord: true,
    airportSettingsStore: new AirportSettingsStoreMock(),
    airportHoursModel,
    classes: {},
    updateGridItem: (updatedModel: AirportHoursModel[]) => '',
  };

  beforeEach(() => {
    wrapper = shallow(<OtOrHoursDetails {...props} />).dive();
    instance = wrapper.instance();
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
    dialogActions = shallow(<div>{wrapper.find(Dialog).prop('dialogActions')()}</div>);
    dialogTitle = shallow(<div>{wrapper.find(Dialog).prop('title')}</div>);
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.resetHistory();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render LinearProgress while loading', () => {
    UIStore.setPageLoader(true);
    expect(dialogActions.find(LinearProgress)).to.have.length(1);
  });

  it('should call closeHandler when dialog closed', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    wrapper.find(Dialog).simulate('close');
    expect(closeSpy.calledOnce).to.be.true;
  });

  it('dialog content should render AirportHoursGrid', () => {
    expect(dialogContent.find(AirportHoursGrid)).to.be.ok;
  });

  it('save button should call Modal', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    dialogActions.find(PrimaryButton).simulate('click');
    expect(closeSpy.calledOnce).to.be.true;
  });

  it('save button should call upsertAirportHours', () => {
    const upsertAirportHoursSpy = sinon.spy(instance, 'upsertAirportHours');
    dialogActions.find(SecondaryButton).simulate('click');
    expect(upsertAirportHoursSpy.calledOnce).to.true;
  });

  it('IconButton button should call autoSizeColumns', () => {
    const autoSizeColumns = sinon.fake();
    // should not call any function
    dialogTitle.find(IconButton).simulate('click');
    expect(autoSizeColumns.calledOnce).to.false;

    // should call autoSizeColumns
    instance.gridRef = { current: { autoSizeColumns } };
    dialogTitle.find(IconButton).simulate('click');
    expect(autoSizeColumns.calledOnce).to.true;
  });

  it('hasError should return proper value', () => {
    expect(instance.hasError).to.be.false;

    instance.gridRef = { current: { hasErrorInGrid: false } };
    expect(instance.hasError).to.be.false;
  });
});
