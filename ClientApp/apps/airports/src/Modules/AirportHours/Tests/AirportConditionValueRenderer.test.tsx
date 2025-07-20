import React from 'react';
import { expect } from 'chai';
import { ShallowWrapper, shallow } from 'enzyme';
import { ConditionValueModel } from '../../Shared';
import { AgGridPopoverWrapper } from '@wings-shared/custom-ag-grid';
import { Chip } from '@material-ui/core';
import { AirportConditionValueRenderer } from '../Components';

describe('Airport Condition Value Renderer', () => {
  let wrapper: ShallowWrapper;

  const props = {
    value: [
      new ConditionValueModel({ id: 1, entityValue: 'Test1' }),
      new ConditionValueModel({ id: 2, entityValue: 'Test2' }),
    ],
  };

  beforeEach(() => {
    wrapper = shallow(<AirportConditionValueRenderer {...props} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render AgGridPopoverWrapper and Chips', () => {
    wrapper.setProps({ value: [...props.value, new ConditionValueModel({ id: 3, entityValue: 'Test3' })] });
    expect(wrapper.find(AgGridPopoverWrapper)).to.have.length(1);
    expect(wrapper.find(Chip)).to.have.length(3);
  });

  it('should nor render AgGridPopoverWrapper and Chips if value is not an array', () => {
    wrapper.setProps({ value: 'Test' });
    expect(wrapper.find(AgGridPopoverWrapper)).to.have.length(0);
    expect(wrapper.find(Chip)).to.have.length(0);
  });
});
