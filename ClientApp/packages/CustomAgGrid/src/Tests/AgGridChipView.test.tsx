import React, { Component } from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { AgGridChipView } from '../Components';
import { expect } from 'chai';
import { SettingsTypeModel } from '@wings-shared/core';
import { Chip } from '@material-ui/core';

describe('AgGridChipView Test Cases', () => {
  let wrapper: ShallowWrapper;
  let instance: any;

  const props = {
    value: [new SettingsTypeModel({ id: 1, name: 'Test' })],
  };

  beforeEach(() => {
    wrapper = shallow(<AgGridChipView {...props} />).dive();
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render chips', () => {
    expect(wrapper.find(Chip)).to.have.length(1);
  });

  it('should not render chips if value is null or empty array', () => {
    wrapper.setProps({ ...props, value: null });
    expect(wrapper.find(Chip)).to.have.length(0);
  });

  it('should return refresh value', () => {
    expect(instance.refresh()).to.true;
  });

  it('should return a object with getGui method', function() {
    instance.textFieldRef = { current: 'TEST' };
    expect(instance.getGui()).to.eq('TEST');
  });

  it('should return refresh value', () => {
    expect(instance.refresh()).to.true;
  });
});
