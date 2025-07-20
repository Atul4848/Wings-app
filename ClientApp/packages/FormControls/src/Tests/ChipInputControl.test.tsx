import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PureChipInputControl } from '../Components/ChipInputControl/ChipInputControl';
import AutoComplete, { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete';
import { ISelectOption } from '@wings-shared/core';


describe('Chip Input Control', function() {
  let wrapper: ShallowWrapper;
  let wrapperInstance;
  const onSearch = sinon.spy(value => {});
  const onChipAddOrRemove = sinon.fake();
  const Options: ISelectOption[] = Array.from(Array(10)).map((val, index): ISelectOption => {
    return { label: `Label ${index}`, value: index };
  });
  const option: ISelectOption = { label: 'Label 0', value: 0 };
  const values = [ 'test', 'Test' ];
  const props = {
    onSearch,
    classes: {
      chipInput: 'test',
    },
    options: [],
    onChipAddOrRemove,
    renderTags: sinon.fake(),
    Options,
    renderInput:sinon.fake(),
  };

  beforeEach(function() {
    wrapper = shallow(<PureChipInputControl {...props} />);
    wrapperInstance = wrapper.instance();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should trigger AutoComplete change event', function() {
    const event: KeyboardEvent = new KeyboardEvent('Enter', { key: 'Enter' });
    wrapper.find(AutoComplete).simulate('change', event, values);
    expect(onChipAddOrRemove.calledWith(values)).to.be.true;
  });

  it('should trigger AutoComplete inputChange event', function() {
    // should return without
    const autocomplete = wrapper.find(AutoComplete);
    autocomplete.simulate('inputChange', null, 'abc', 'reset');
    expect(wrapperInstance.inputValue).to.equals('');
    
    // should set value
    autocomplete.simulate('inputChange', null, 'TEST', 'input');
    expect(wrapperInstance.inputValue).to.equals('TEST');
  });
  
  it('should render tags', function() {
    const getTagProps: AutocompleteGetTagProps = index => {
      return { index };
    };
    const renderTags: Function = wrapper.find(AutoComplete).prop('renderTags');
    expect(renderTags(values, getTagProps).length).to.eq(values.length);
  });

  it('should getOptionLabel', function() {
    const getOptionLabel: Function = wrapper.find(AutoComplete).prop('getOptionLabel');
    expect(getOptionLabel(option)).to.equal(option.label);
  });

  it('should render getOptionSelected', function() {
    const getOptionSelected: Function = wrapper.find(AutoComplete).prop('getOptionSelected');
    expect(getOptionSelected(option, null)).to.be.false;
    expect(getOptionSelected(option, option)).to.be.true;
  });

  it('should not call renderTags prop', function() {
    wrapper.setProps({ renderTags: null });
    wrapper.find(AutoComplete).prop('renderTags')(Options, sinon.fake());
    expect(props.renderTags.calledOnce).to.be.false;
  });

  it('should renderInput', function() {
    const inputNode: Function = wrapper.find(AutoComplete).prop('renderInput');
    expect(
      inputNode({
        InputProps: {
          startAdornment: <div>TEST</div>,
        },
      })
    ).not.to.be.null;
  });

  it('should clear input value with clearInputValue', function() {
    wrapperInstance.inputValue = 'ABC';
    wrapperInstance.clearInputValue();
    expect(wrapperInstance.inputValue).eq('');
  });
});
