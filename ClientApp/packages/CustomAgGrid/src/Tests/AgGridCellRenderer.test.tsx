import React from 'react';
import { ShallowWrapper, shallow } from 'enzyme';
import { expect } from 'chai';
import { AgGridCellRenderer } from '../Components';
import { Tooltip } from '@material-ui/core';
import sinon from 'sinon';

describe('AgGridCellRenderer', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;

  const props = {
    classes: {},
    colDef: { field: 'value' },
    value: 'Test',
  };

  beforeEach(() => {
    wrapper = shallow(<AgGridCellRenderer {...props} />).dive();
    wrapperInstance = wrapper.instance();
  });

  afterEach(() => wrapper.unmount());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should refresh agGridCheckBox', () => {
    expect(wrapperInstance.refresh()).to.eq(true);
  });

  it('should return a object with getGui method', () => {
    wrapperInstance.textFieldRef = { current: 'TEST' };
    expect(wrapperInstance.getGui()).to.eq('TEST');
  });

  it('should show tooltip', () => {
    const setOpenSpy = sinon.spy(wrapperInstance, 'setOpen');
    wrapper.find(Tooltip).simulate('mouseEnter');
    expect(setOpenSpy.calledWith(true)).to.eq(true);
  });

  it('should call onMouseLeave', () => {
    const setOpenSpy = sinon.spy(wrapperInstance, 'setOpen');
    wrapper.find(Tooltip).simulate('mouseLeave');
    expect(setOpenSpy.calledWith(false)).to.eq(true);
  });

  it('should call span onClick', () => {
    const setOpenSpy = sinon.spy(wrapperInstance, 'setOpen');
    wrapper.find('span').simulate('click');
    expect(setOpenSpy.calledWith(false)).to.eq(true);
  });
});
