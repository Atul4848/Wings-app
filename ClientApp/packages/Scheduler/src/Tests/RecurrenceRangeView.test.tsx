import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { recurrenceRangeTypeOptions, RecurrenceRangeView } from '../Components';
import { ScheduleModel } from '../Models';
import { ViewInputControl } from '@wings-shared/form-controls';

const onChange = sinon.fake();
describe('RecurrenceRangeView Component', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;
  let onValueChangeSpy: sinon.SinonSpy;

  const props = {
    scheduleData: new ScheduleModel({ id: 1 }),
    onChange,
  };

  beforeEach(() => {
    wrapper = shallow(<RecurrenceRangeView {...props} />).dive();
    wrapperInstance = wrapper.instance();
    onValueChangeSpy = sinon.spy(wrapperInstance, 'onValueChange');
  });

  afterEach(() => onValueChangeSpy.resetHistory());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should update start Date with ViewInputControl', () => {
    wrapper.find(ViewInputControl).at(0).simulate('valueChange', 'TEST', 'startDate');
    expect(onValueChangeSpy.calledWith('TEST', 'startDate')).to.be.true;
  });

  it('should update recurrenceRangeType with ViewInputControl', () => {
    const value = recurrenceRangeTypeOptions[0];
    wrapper.find(ViewInputControl).at(1).simulate('valueChange', value, 'recurrenceRangeType');
    expect(onValueChangeSpy.calledWith(value, 'recurrenceRangeType')).to.be.true;
  });

  it('should update numberOfOccurrences with ViewInputControl', () => {
    wrapper.find(ViewInputControl).at(1).simulate('valueChange', recurrenceRangeTypeOptions[2], 'recurrenceRangeType');

    wrapper.find(ViewInputControl).at(2).simulate('valueChange', 2, 'numberOfOccurrences');
    expect(onValueChangeSpy.calledWith(2, 'numberOfOccurrences')).to.be.true;
  });

  it('should update endDate with ViewInputControl', () => {
    wrapper.find(ViewInputControl).at(1).simulate('valueChange', recurrenceRangeTypeOptions[0], 'recurrenceRangeType');
    wrapper.find(ViewInputControl).at(2).simulate('valueChange', '01-04-2022', 'endDate');
    expect(onValueChangeSpy.calledWith('01-04-2022', 'endDate')).to.be.true;
  });

  it('should call callback ViewInputControl', () => {
    const setFormValues = sinon.spy(wrapperInstance, 'setFormValues');
    // callback with false
    wrapper.setProps({ props, onChange: (updatedValue, callback) => callback(false) });
    wrapperInstance.onValueChange('test', 'endDate');
    expect(setFormValues.called).to.be.false;

    // callback with true
    wrapper.setProps({ props, onChange: (updatedValue, callback) => callback(true) });
    wrapperInstance.onValueChange('test', 'endDate');
    expect(setFormValues.called).to.be.true;
  });
});
