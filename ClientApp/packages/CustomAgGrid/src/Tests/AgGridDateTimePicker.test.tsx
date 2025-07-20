import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import moment from 'moment';
import { PureAgGridDateTimePicker } from '../Components/AgGridDateTimePicker/AgGridDateTimePicker';
import { createTheme } from '@material-ui/core/styles';
import { LightTheme } from '@uvgo-shared/themes';
import { DATE_FORMAT } from '@wings-shared/core';
import { DateTimePicker } from '@wings-shared/form-controls';

describe('AgGridDateTimePicker', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: PureAgGridDateTimePicker;
  const currentDate: string = moment().format(DATE_FORMAT.API_FORMAT);
  const focus: sinon.SinonSpy = sinon.mock();
  const onInputChange = sinon.spy();
  const selectedDate: string = moment().toISOString();
  const theme = createTheme(LightTheme);
  const props = {
    theme,
    classes: { root: 'test' },
    format: DATE_FORMAT.API_FORMAT,
    cellStartedEdit: true,
    value: currentDate,
    rules: 'required',
    colDef: {},
    context: { componentParent: { onInputChange } },
  };

  const mountComponent = function(props: {} = {}) {
    wrapper = shallow(<PureAgGridDateTimePicker {...props} />);
    wrapperInstance = wrapper.instance() as PureAgGridDateTimePicker;
    wrapperInstance.afterGuiAttached();
  };

  beforeEach(() => {
    mountComponent(props);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should validate form data', () => {
    wrapper.setProps({ format: null });
    expect(wrapperInstance.isCancelAfterEnd()).to.be.false;
  });

  it('should get value', () => {
    expect(wrapperInstance.getValue()).to.eq(currentDate);
  });

  it('should set value', () => {
    wrapperInstance.setValue('TEST');
    expect(wrapperInstance.getValue()).to.eq('TEST');
  });

  it('should not focus', () => {
    wrapperInstance.focusIn();
    expect(focus.called).not.to.be.true;
  });

  it('should call on change', () => {
    const { onInputChange } = props.context.componentParent;
    wrapper
      .dive()
      .find(DateTimePicker)
      .prop('onChange')(selectedDate);
    expect(onInputChange.called).to.be.true;
  });

  it('should set hasFocus on focus and on blur', () => {
    wrapper
      .dive()
      .find(DateTimePicker)
      .simulate('focus');
    expect(wrapperInstance.hasFocus).to.be.true;

    wrapper
      .dive()
      .find(DateTimePicker)
      .simulate('blur');
    expect(wrapperInstance.hasFocus).to.be.false;
  });
});
