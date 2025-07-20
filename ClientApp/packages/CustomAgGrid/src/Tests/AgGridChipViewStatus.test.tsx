import React, { Component } from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { AgGridChipView, AgGridChipViewStatus } from '../Components';
import { expect } from 'chai';
import { SettingsTypeModel } from '@wings-shared/core';
import { Chip } from '@material-ui/core';

describe('AgGridChipViewStatus Test Cases', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let defaultProps = {
    chipLabelField: 'label',
    tooltipField: 'label',
    isString: false,
  };
  beforeEach(() => {
    wrapper = shallow(<AgGridChipViewStatus props={defaultProps} />).dive();
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render chips', () => {
    wrapper.setProps({ ...defaultProps, isString: true });
    expect(wrapper.find(Chip)).to.have.length(1);
  });

  it('should return refresh value', () => {
    expect(instance.refresh()).to.true;
  });

  it('should return a object with getGui method', function() {
    instance.textFieldRef = { current: 'TEST' };
    expect(instance.getGui()).to.eq('TEST');
  });
});
