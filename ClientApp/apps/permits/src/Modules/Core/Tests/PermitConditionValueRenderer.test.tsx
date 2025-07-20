import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { Chip } from '@material-ui/core';
import { AgGridPopoverWrapper } from '@wings-shared/custom-ag-grid';
import { getStringToYesNoNull } from '@wings-shared/core';
import PermitConditionValueRenderer from '../Components/PermitRequirements/PermitConditionValueRenderer';

describe('PermitConditionValueRenderer Component', () => {
  let wrapper;

  const mountComponent = (value) => {
    wrapper = mount(<PermitConditionValueRenderer value={value} />);
  };

  // Cleanup after each test
  afterEach(() => {
      wrapper.unmount();
  });

  it('should return an empty string if value is not an array', () => {
    mountComponent(null);
    expect(wrapper.text()).to.equal('');
  });

  it('should render a single value correctly when array length is 1', () => {
    const value = [{ code: 'ABC' }];
    mountComponent(value);
    expect(wrapper.text()).to.equal('ABC');
  });

  it('should render ruleValue when code is empty or null, and ruleValue is a boolean-like value', () => {
    const value = [{ code: '', ruleValue: true }];
    mountComponent(value);
    expect(wrapper.text()).to.equal(getStringToYesNoNull(true));
  });

  it('should render ruleValue directly if code is empty or null and ruleValue is not boolean-like', () => {
    const value = [{ code: '', ruleValue: 'SomeValue' }];
    mountComponent(value);
    expect(wrapper.text()).to.equal('SomeValue');
  });

});
