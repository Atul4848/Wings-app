import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { AgGridWeekDaysWidget } from '../Components';
import { AirportHoursModel } from '@wings/airports/src/Modules/Shared';
import { ScheduleModel, daysOfWeekOptions, RECURRENCE_PATTERN_TYPE, DayOfWeekModel } from '@wings-shared/scheduler';
import { ButtonBase } from '@material-ui/core';

describe('AgGridWeekDaysWidget', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  const props = {
    classes: {},
    data: new AirportHoursModel({
      schedule: new ScheduleModel(),
    }),
    value: [],
    context: { componentParent: { onInputChange: sinon.fake() } },
  };

  beforeEach(() => {
    wrapper = shallow(<AgGridWeekDaysWidget {...props} />).dive();
    instance = wrapper.instance();
  });

  afterEach(() => wrapper.unmount());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(instance.getValue()).to.have.lengthOf(0);
  });

  it('should call day selection on Button Click', () => {
    const onDaySelection = sinon.spy(instance, 'onDaySelection');
    wrapper
      .find(ButtonBase)
      .at(0)
      .simulate('click');
    expect(onDaySelection.calledOnce).to.be.true;
    expect(instance.hasError).to.be.false;
  });

  it('onDaySelection should select unselect days properly', () => {
    // on selection
    instance.recurrencePatternTypeId = RECURRENCE_PATTERN_TYPE.WEEKLY;
    instance.onDaySelection(daysOfWeekOptions[0]);
    expect(instance.selectedDays).to.have.lengthOf(1);

    // if already selected
    instance.onDaySelection(daysOfWeekOptions[0]);
    expect(instance.selectedDays).to.have.lengthOf(0);
  });

  it('should call day selection on Button Click for Customs Type Hours case', () => {
    wrapper.setProps({ ...props, isCustomsTypeHours: () => true });
    const onDaySelection = sinon.spy(instance, 'onDaySelection');
    wrapper
      .find(ButtonBase)
      .at(2)
      .simulate('click');
    expect(onDaySelection.calledOnce).to.be.true;
    expect(instance.hasError).to.be.false;
  });

  it('should call day selection on Button Click for Daily case', () => {
    instance.recurrencePatternTypeId = RECURRENCE_PATTERN_TYPE.DAILY;
    const onDaySelection = sinon.spy(instance, 'onDaySelection');
    wrapper
      .find(ButtonBase)
      .at(3)
      .simulate('click');
    expect(onDaySelection.calledOnce).to.be.true;
  });

  it('should call day selection on Button Click for Exists case', () => {
    instance.selectedDays = [new DayOfWeekModel({ dayOfWeekId: 4 }), new DayOfWeekModel({ dayOfWeekId: 1 })];
    const onDaySelection = sinon.spy(instance, 'onDaySelection');
    wrapper
      .find(ButtonBase)
      .at(3)
      .simulate('click');
    expect(onDaySelection.calledOnce).to.be.true;
  });

  it('should check for no schedule and has error', () => {
    wrapper.setProps({ ...props, isNoSchedule: () => true });
    expect(instance.isNoSchedule).to.be.true;
    expect(instance.hasError).to.be.false;
  });
});
