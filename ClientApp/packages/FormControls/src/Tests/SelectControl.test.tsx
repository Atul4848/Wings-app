import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import * as sinon from 'sinon';
import { SelectControl } from '../Components';
import { expect } from 'chai';
import { FormLabel } from '@material-ui/core';

describe('Select Control', function() {
  let wrapper: ShallowWrapper;

  const props = {
    classes: {},
    disabled: true,
    field: { bind: () => sinon.fake(), label: 'TEST', value: true, onFocus: sinon.fake() },
    onValueChange: sinon.fake(),
    options: [],
    isBoolean: true,
    showLabel: false,
    booleanOptions: [],
    excludeEmptyOption: false,
  };
  beforeEach(function() {
    wrapper = shallow(<SelectControl {...props} />).dive();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });
  it('should rendered FormLabel', function() {
    wrapper.setProps({ showLabel: true });
    expect(FormLabel).to.be.exist;
  });
  it('should not render FormLabel when showLabel is false', function() {
    expect(wrapper.find(FormLabel)).to.have.length(0);
  });

  it('should call onFocus when SelectInputControl is focused', function() {
    const selectInputControl = wrapper.find('SelectInputControl');
    selectInputControl.simulate('focus');
    expect(props.field.onFocus.called).to.be.true;
  });
});
