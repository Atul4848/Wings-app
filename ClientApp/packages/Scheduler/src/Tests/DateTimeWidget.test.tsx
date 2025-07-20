import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { ScheduleModel } from '../Models';
import { expect } from 'chai';
import sinon from 'sinon';
import { DateTimeWidget } from '../Components';
import { ViewInputControl } from '@wings-shared/form-controls';
import { IOptionValue } from '@wings-shared/core';

describe('DateTimeWidget', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  const onChange = sinon.spy();
  const props = {
    isEventSchedule: false,
    classes: {},
    onChange,
    scheduleData: new ScheduleModel(),
    showDuration: false,
    showDates: true,
    timeZonesList: [],
  };

  const valueChange = (index: number, value: IOptionValue, fieldKey: string) =>
    wrapper.find(ViewInputControl).at(index).simulate('valueChange', value, fieldKey);

  beforeEach(() => {
    wrapper = shallow(<DateTimeWidget {...props} />).dive();
    instance = wrapper.instance();
  });

  afterEach(() => wrapper.unmount());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should not call onChange  with null values', () => {
    instance.setFormValues(null);
    expect(onChange.notCalled).to.true;
  });

  it('should update is24Hours', () => {
    valueChange(0, true, 'is24Hours');
    expect(instance.getField('is24Hours').value).to.be.true;
  });

  it('should update start time', () => {
    valueChange(1, 'TEST', null);
    expect(instance.getField('startTime.time').value).to.eq('TEST');
  });

  it('should update end time', () => {
    valueChange(4, 'TEST', null);
    expect(instance.getField('endTime.time').value).to.eq('TEST');
  });

  it('should reset startTime.time and startTime.offSet on change of startTime.solarTime', () => {
    instance.getField('startTime.time').set('TEST');
    instance.getField('startTime.offSet').set(-1);
    instance.onValueChange(1, 'startTime.solarTime');
    expect(instance.getField('startTime.time').value).to.be.empty;
    expect(instance.getField('startTime.offSet').value).to.be.empty;
  });

  it('should reset endTime.time and endTime.offSet on change of endTime.solarTime', () => {
    instance.getField('endTime.time').set('TEST');
    instance.getField('endTime.offSet').set(-1);
    instance.onValueChange(1, 'endTime.solarTime');
    expect(instance.getField('endTime.time').value).to.be.empty;
    expect(instance.getField('endTime.offSet').value).to.be.empty;
  });

  it('should render isEventSchedule', () => {
    wrapper.setProps({ props, isEventSchedule: true });
    expect(wrapper.find(ViewInputControl)).to.have.length(3);
  });
});
