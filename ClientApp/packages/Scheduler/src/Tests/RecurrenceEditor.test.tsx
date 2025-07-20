import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ScheduleModel } from '../Models';
import { RecurrenceEditor,RecurrenceRangeView,DateTimeWidget,RecurrencePatternView } from '../Components';

describe('RecurrenceEditor Module', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;
  const onChange = sinon.fake();

  const props = {
    scheduleData: new ScheduleModel(),
    classes: {},
    onChange,
  };

  beforeEach(() => {
    wrapper = shallow(<RecurrenceEditor {...props} />).dive();
    wrapperInstance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
    onChange.resetHistory();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should call onChange with RecurrenceRangeView', () => {
    wrapper.find(RecurrenceRangeView).simulate('change', new ScheduleModel({ id: 1 }));
    expect(onChange.calledOnce).to.be.true;
  });

  it('should call onChange with DateTimeWidget', () => {
    wrapper.find(DateTimeWidget).simulate('change', new ScheduleModel({ id: 1 }));
    expect(onChange.calledOnce).to.be.true;
  });

  it('should call onChange with RecurrencePatternView', () => {
    wrapper.find(RecurrencePatternView).simulate('change', new ScheduleModel({ id: 1 }));
    expect(onChange.calledOnce).to.be.true;
  });
});
