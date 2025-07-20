import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { AgGridCheckBox } from '../Components';
import { Checkbox, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { RowNode } from 'ag-grid-community';

describe('AgGridCheckBox React', function() {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;
  const theme = createTheme(LightTheme);
  const onChange = sinon.fake((node: RowNode, checked: boolean) => null);

  const props = {
    context: { theme, componentParent: { onInputChange: sinon.fake() } },
    checked: true,
    onChange,
    node: new RowNode(),
    readOnly: false,
    getValue: () => true,
  };

  beforeEach(function() {
    wrapper = shallow(<AgGridCheckBox {...props} />).dive();
    wrapperInstance = wrapper.instance();
  });

  afterEach(function() {
    wrapper.unmount();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should call checkbox onChange', function() {
    wrapperInstance.isChecked = false;

    //should trigger parent onChange method
    wrapper.find(Checkbox).prop('onChange')(null, true);
    expect(onChange.calledWith(props.node, props.checked)).to.true;

    //should set checkBox status
    wrapper.setProps({ ...props, onChange: null });
    wrapper.find(Checkbox).prop('onChange')(null, true);
    expect(wrapperInstance.isChecked).to.true;

    //parent onChange should not be called if readOnly is true
    wrapper.setProps({ ...props, readOnly: true });
    wrapper.find(Checkbox).prop('onChange')(null, true);
    expect(onChange.calledOnce).to.false;
  });

  it('should refresh agGridCheckBox', function() {
    expect(wrapperInstance.refresh('')).to.true;
  });

  it('should return a object with getGui method', function() {
    wrapperInstance.textFieldRef = { current: 'TEST' };
    expect(wrapperInstance.getGui()).to.eq('TEST');
  });

  it('should return the checkbox checked status', function() {
    wrapperInstance.isChecked = false;
    expect(wrapperInstance.getValue()).to.be.false;
  });
});
