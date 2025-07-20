import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import RecurrencePatternView from '../Components/RecurrencePatternView/RecurrencePatternView';
import { ScheduleModel } from '../Models';
import { recurrencePatternOptions } from '../Components/fields';
import { RECURRENCE_PATTERN_TYPE } from '../Enums';
import { WeeklyView, MonthlyView, YearlyView } from '../Components';

import { expect } from 'chai';
import * as sinon from 'sinon';
import { RecurrenceTabs } from '../Components';
import { ViewInputControl } from '@wings-shared/form-controls';

describe('RecurrencePatternView Component', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;
  let getFieldSpy: sinon.SinonSpy;
  let onValueChangeSpy: sinon.SinonSpy;

  const onChange = sinon.fake();

  const props = {
    isEditable: true,
    onChange,
    scheduleData: new ScheduleModel({ id: 1 }),
  };

  beforeEach(() => {
    wrapper = shallow(<RecurrencePatternView {...props} />).dive();
    wrapperInstance = wrapper.instance();
    getFieldSpy = sinon.spy(wrapperInstance, 'getField');
    onValueChangeSpy = sinon.spy(wrapperInstance, 'onValueChange');
  });

  afterEach(() => {
    getFieldSpy.resetHistory();
    onValueChangeSpy.resetHistory();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should call  onTabChange without errors', () => {
    const onTabChangeSpy = sinon.spy(wrapperInstance, 'onTabChange');
    const customTab = wrapper.find(RecurrenceTabs);
    recurrencePatternOptions.forEach(({ name }, index) => {
      customTab.simulate('tabChange', index, name);
      expect(onTabChangeSpy.calledWith(index, name)).to.true;
      onTabChangeSpy.resetHistory();
    });
  });

  it('should disable all tabs if isEditable is true', () => {
    wrapper.setProps({ ...props, isEditable: false });
    const customTab = wrapper.find(RecurrenceTabs);
    expect(customTab.prop('isDisable')(1)).to.be.true;
    expect(customTab.prop('isDisable')(2)).to.be.true;
  });

  it('should be render ViewInputControl View', () => {
    wrapper.find(ViewInputControl).simulate('valueChange', 'TEST', 'interval');
    expect(onValueChangeSpy.calledWith('TEST', 'interval')).to.be.true;
  });

  it('should be render WeeklyView', () => {
    const weeklyView = wrapper.find(WeeklyView);
    weeklyView.simulate('change', 'TEST', 'interval');
    expect(onValueChangeSpy.calledWith('TEST', 'interval')).to.be.true;

    // getField
    weeklyView.prop('getField')('interval');
    expect(getFieldSpy.calledWith('interval')).to.true;
  });

  it('should be render MonthlyView', () => {
    const monthlyView = wrapper.find(MonthlyView);
    monthlyView.simulate('change', 'TEST', 'interval');
    expect(onValueChangeSpy.calledWith('TEST', 'interval')).to.be.true;

    // getField
    monthlyView.prop('getField')('interval');
    expect(getFieldSpy.calledWith('interval')).to.true;
  });

  it('should be render YearlyView', () => {
    const yearlyView = wrapper.find(YearlyView);
    yearlyView.simulate('change', 'TEST', 'interval');
    expect(onValueChangeSpy.calledWith('TEST', 'interval')).to.be.true;

    // getField
    yearlyView.prop('getField')('interval');
    expect(getFieldSpy.calledWith('interval')).to.true;
  });

  it('should return proper tab index with getDefaultActiveTab', () => {
    expect(wrapperInstance.getDefaultActiveTab(RECURRENCE_PATTERN_TYPE.DAILY)).to.be.equals(0);
    expect(wrapperInstance.getDefaultActiveTab(RECURRENCE_PATTERN_TYPE.WEEKLY)).to.be.equals(1);
    expect(wrapperInstance.getDefaultActiveTab(RECURRENCE_PATTERN_TYPE.MONTHLY)).to.be.equals(2);
    expect(wrapperInstance.getDefaultActiveTab(RECURRENCE_PATTERN_TYPE.YEARLY)).to.be.equals(3);
  });
});
