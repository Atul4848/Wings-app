import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { ScheduleView } from '../Components';
import { ViewInputControl } from '@wings-shared/form-controls';
import { ScheduleModel } from '../Models';

describe('ScheduleView Tests', () => {
  let wrapper: ShallowWrapper;
  let instance;
  const onChange = sinon.spy();

  const props = {
    classes: {},
    onChange,
    stddstTypes: [],
    scheduleData: new ScheduleModel({ id: 1 }),
  };

  beforeEach(() => {
    wrapper = shallow(<ScheduleView {...props} />).dive();
    instance = wrapper.instance();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should call addAirportHours with save button', () => {
    const testValue = 'TEST';
    const onValueChangeSpy = sinon.spy(instance, 'onValueChange');
    wrapper.find(ViewInputControl).at(0).simulate('valueChange', testValue, null);
    expect(onValueChangeSpy.calledWith(testValue)).to.be.true;
  });
});
