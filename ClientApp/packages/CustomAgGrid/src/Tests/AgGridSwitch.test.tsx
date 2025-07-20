import React, { ChangeEvent } from 'react';
import { ShallowWrapper, shallow } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { AgGridSwitch } from '../Components';
import Switch from '@material-ui/core/Switch';
import { createTheme } from '@material-ui/core/styles';
import { LightTheme } from '@uvgo-shared/themes';

describe('AgGridSwitch', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;
  const onSwitchChangeHandler = sinon.fake();
  const theme = createTheme(LightTheme);
  const props = {
    theme,
    classes: {},
    cellStartedEdit: true,
    rowIndex: 0,
    value: true,
    isReadOnly: false,
    context: { componentParent: {} },
  };

  const mountComponent = (props: {} = {}) => {
    wrapper = shallow(<AgGridSwitch {...props} />).dive();
    wrapperInstance = wrapper.instance();
  };

  beforeEach(() => mountComponent(props));

  afterEach(() => wrapper.unmount());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should get value', () => {
    expect(wrapperInstance.getValue()).to.eq(props.value);

    //should render empty value
    mountComponent({ ...props, cellStartedEdit: false, value: false });
    expect(wrapperInstance.getValue()).to.eq(false);
  });

  it('should call setValue', () => {
    wrapperInstance.setValue(true);
    expect(wrapperInstance.isActive).to.be.true;
  });

  it('should trigger change handler', () => {
    wrapper.setProps({ ...props, isReadOnly: true });
    const event = { target: { value: '' } };
    const switchField = wrapper.find(Switch);
    switchField.simulate('change', event, false);
    expect(onSwitchChangeHandler.called).to.be.false;

    wrapper.setProps({ ...props, context: { componentParent: { onSwitchChangeHandler } } });
    switchField.simulate('change', event, true);
    expect(onSwitchChangeHandler.calledOnce).to.be.true;
  });
});
