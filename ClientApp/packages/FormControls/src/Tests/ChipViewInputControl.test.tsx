import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import AutoComplete, { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete';
import { PureChipViewInputControl } from '../Components/ChipViewInputControl/ChipViewInputControl';
import { Chip } from '@material-ui/core';

describe('Chip Input Control', function() {
  let wrapper: ShallowWrapper;
  let wrapperInstance;
  const onChipAddOrRemove = sinon.fake();

  const value = [ 'test', 'Test1' ];
  const props = {
    classes: {
      chipInput: 'test',
    },
    onChipAddOrRemove,
    field: {
      value,
      label: 'string',
      hasError: false,
    },
    isEditable: true,
    placeHolder: 'test',
    isLeftIndent: true,
  };

  beforeEach(function() {
    wrapper = shallow(<PureChipViewInputControl {...props} />);
    wrapperInstance = wrapper.instance();
  });

  afterEach(function() {
    wrapper.unmount();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should renderInput', function() {
    const inputNode: Function = wrapper.find(AutoComplete).prop('renderInput');
    expect(inputNode({ inputProps: 'test' })).not.to.be.null;
  });

  it('textfield should call inputchange function ', function() {
    const spy = sinon.spy(wrapperInstance, 'onInputChange');
    const inputNode: Function = wrapper.find(AutoComplete).prop('renderInput');
    shallow(inputNode()).simulate('Change', { target: { value: 'test' } });
    expect(spy.called).to.be.true;
  });

  it('textfield should call onKeyPressedEvent function ', function() {
    const spy = sinon.spy(wrapperInstance, 'onKeyPressedEvent');
    const inputNode: Function = wrapper.find(AutoComplete).prop('renderInput');
    shallow(inputNode()).simulate('KeyUp', { key: 'Enter' });
    expect(spy.called).to.be.true;
  });

  it('textfield should call updateValue function onBlur', function() {
    const spy = sinon.spy(wrapperInstance, 'updateValue');
    const inputNode: Function = wrapper.find(AutoComplete).prop('renderInput');
    shallow(inputNode()).simulate('Blur');
    expect(spy.called).to.be.true;
  });

  it('should trigger AutoComplete change event', function() {
    const spy = sinon.spy(wrapperInstance, 'onChange');
    wrapper.find(AutoComplete).simulate('change', null, value);
    expect(spy.calledWith(value)).to.be.true;
  });

  it('textfield should call onKeyPressedEvent function ', function() {
    const spy = sinon.spy(wrapperInstance, 'onKeyPressedEvent');
    wrapperInstance.textInputValue = 'test';
    const inputNode: Function = wrapper.find(AutoComplete).prop('renderInput');
    shallow(inputNode()).simulate('KeyUp', { key: 'Enter' });
    expect(spy.called).to.be.true;
  });

  it('should render tags in edit mode', function() {
    const getTagProps: AutocompleteGetTagProps = index => {
      return { index };
    };
    const renderTags: Function = wrapper.find(AutoComplete).prop('renderTags');
    expect(renderTags(value, getTagProps).length).to.eq(value.length);
  });

  it('should render tags in details mode', function() {
    props.isEditable = false;
    expect(wrapper.find(Chip)).to.have.length(value.length);
  });
});
