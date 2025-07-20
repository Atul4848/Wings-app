import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import { expect } from 'chai';
import moment from 'moment';
import * as sinon from 'sinon';
import { KeyboardDatePicker, KeyboardDateTimePicker, KeyboardTimePicker } from '@material-ui/pickers';
import { DATE_TIME_PICKER_TYPE } from '@wings-shared/core';
import { DateTimePicker } from '../Components';

describe('DateTimePicker', function () {
  let wrapper: ShallowWrapper;
  let instance: any;
  const onChange = sinon.spy();
  const selectedDate: moment.Moment = moment();
  const props = {
    onChange,
    pickerType: DATE_TIME_PICKER_TYPE.DATE_TIME,
    allowKeyboardInput: true,
  };

  beforeEach(function () {
    wrapper = shallow(<DateTimePicker {...props} />).dive();
    instance = wrapper.instance();
  });

  afterEach(function () {
    wrapper.unmount();
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.have.length(1);
  });

  it('should trigger DATE TIME picker change handler', function () {
    wrapper.find(KeyboardDateTimePicker).simulate('change', selectedDate);
    expect(onChange.called).to.be.true;
  });

  it('should trigger DATE picker change handler', function () {
    wrapper.setProps({ pickerType: DATE_TIME_PICKER_TYPE.DATE });
    wrapper.find(KeyboardDatePicker).simulate('change', selectedDate);
    expect(onChange.called).to.be.true;
  });

  it('should trigger TIME picker change handler', function () {
    wrapper.setProps({ pickerType: DATE_TIME_PICKER_TYPE.TIME });
    wrapper.find(KeyboardTimePicker).simulate('change', selectedDate);
    expect(onChange.called).to.be.true;
  });

  it('should trigger DATE_TIME picker key down event', function () {
    const keyPress = sinon.spy(instance, 'onKeyPress');
    wrapper.setProps({ onChange });
    const keyDown = wrapper.find(KeyboardDateTimePicker).simulate('keyDown', { preventDefault() {} });
    expect(keyPress.calledOnce).to.be.true;
    expect(keyDown).to.have.length(1);
  });

  it('should trigger DATE_TIME picker key down event called with props', function() {
    const keyPress = sinon.spy(instance, 'onKeyPress');
    wrapper.setProps({ onChange, allowKeyboardInput: false, minDate: '2020-12-01', maxDate: '2020-12-15' });
    const keyDown = wrapper.find(KeyboardDateTimePicker).simulate('keyDown', { preventDefault() {} });
    expect(keyPress.calledOnce).to.be.true;
    expect(keyDown).to.have.length(1);
  });

  it('should trigger DATE picker key down event', function () {
    wrapper.setProps({ pickerType: DATE_TIME_PICKER_TYPE.DATE });
    const keyDown = wrapper.find(KeyboardDatePicker).simulate('keyDown', { preventDefault() {} });
    expect(keyDown).to.have.length(1);
  });

  it('should trigger TIME picker key down event', function () {
    wrapper.setProps({ pickerType: DATE_TIME_PICKER_TYPE.TIME });
    const keyDown = wrapper.find(KeyboardTimePicker).simulate('keyDown', { preventDefault() {} });
    expect(keyDown).to.have.length(1);
  });
});
