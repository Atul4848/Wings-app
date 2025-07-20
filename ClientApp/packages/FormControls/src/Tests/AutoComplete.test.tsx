import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PureAutoCompleteControl } from '../Components/AutoComplete/AutoComplete';
import { createMuiTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import AutoComplete from '@material-ui/lab/Autocomplete';
import { ISelectOption } from '@wings-shared/core';

const getOptions = (): ISelectOption[] => {
  return Array.from(Array(10)).map((val, index): ISelectOption => {
    return { label: `Label ${index}`, value: index };
  });
};
describe('AutoComplete Component', function() {
  let wrapper: ShallowWrapper;
  let instance;
  const option: ISelectOption = { label: 'Label 0', value: 0 };
  const theme = createMuiTheme(LightTheme);
  const options: ISelectOption[] = getOptions();
  const onDropDownChange = sinon.fake();
  const value: ISelectOption = { value: 1, label: '' };
  const field = {
    label: 'Test field label',
    placeholder: 'Test field placeholder',
    rules: 'string|required',
    value: 'Test value',
    blurred: false,
    hasError: false,
    bind: sinon.fake(),
  };
  const props = {
    classes: {},
    theme,
    valueGetter: (selectedOption: ISelectOption | ISelectOption[]) => '',
    onDropDownChange,
    options,
    value,
    field,
    hasError: false,
    onFocus: sinon.fake(),
    onBlur: sinon.fake(),
    renderTags: sinon.fake(),
    getOptionDisabled: sinon.fake(),
  };

  beforeEach(function() {
    wrapper = shallow(<PureAutoCompleteControl {...props} />);
    instance = wrapper.instance();
  });

  it('should rendered correctly', function() {
    expect(wrapper).to.have.length(1);
  });
  
  it('should trigger AutoComplete change event if not have selectedValue', function() {
    const autoCompleteOnChange: Function = wrapper.find(AutoComplete).prop('onChange');
    autoCompleteOnChange(null, null);
    expect(onDropDownChange.calledWith(null)).to.be.true;
  });

  it('should trigger AutoComplete change event', function() {
    const autoCompleteOnChange: Function = wrapper.find(AutoComplete).prop('onChange');
    autoCompleteOnChange(null, 'TEST');
    expect(onDropDownChange.calledWith('TEST')).to.be.true;
  });

  it('should trigger AutoComplete change event when onInputChange does not have newInputValue', function() {
    const autoCompleteOnChange: Function = wrapper.find(AutoComplete).prop('onInputChange');
    autoCompleteOnChange(null, null);
    expect(onDropDownChange.calledWith(null)).to.be.true;
  });

  it('should getOptionLabel', function() {
    const getOptionLabel: Function = wrapper.find(AutoComplete).prop('getOptionLabel');
    expect(getOptionLabel(option)).to.equal(option.label);
  });

  it('should renderInput', function() {
    const inputNode: Function = wrapper.find(AutoComplete).prop('renderInput');
    expect(inputNode({ inputProps: 'test' })).not.to.be.null;
  });

  it('should ListboxComponent', function() {
    const listboxComponent: React.ComponentType<React.HTMLAttributes<HTMLElement>> = wrapper
      .find(AutoComplete)
      .prop('ListboxComponent');
    expect(listboxComponent).not.to.be.null;
  });

  it('should check hasError and value', function() {
    //having field and data
    wrapper.setProps({ field, value: 5 });
    expect(instance.hasError).to.be.false;
    expect(instance.value).to.be.not.null;

    //value is null
    field.hasError = true;
    field.blurred = true;
    wrapper.setProps({ value: null, field });
    expect(instance.hasError).to.be.true;

    //field is null
    wrapper.setProps({ field: null, value: '' });
    expect(instance.hasError).to.be.false;
    expect(instance.value).to.be.equal(null);
  });

  it('should render getOptionSelected', function() {
    const getOptionSelected: Function = wrapper.find(AutoComplete).prop('getOptionSelected');
    expect(getOptionSelected(option, null)).to.be.false;
    expect(getOptionSelected(option, options)).to.be.true;
    expect(getOptionSelected(option, option)).to.be.false;
  });

  it('should render renderOption', function() {
    const renderOption: Function = wrapper.find(AutoComplete).prop('renderOption');
    expect(renderOption(props.field.label)).to.be.ok;
  });

  it('should not call renderTags prop', function() {
    wrapper.setProps({ renderTags: null });
    wrapper.find(AutoComplete).prop('renderTags')(options, sinon.fake());
    expect(props.renderTags.calledOnce).to.be.false;
  });

  it('should call renderTags prop', function() {
    wrapper.find(AutoComplete).prop('renderTags')(options, sinon.fake());
    expect(props.renderTags.calledOnce).to.be.true;
  });

  it('should call getOptionDisabled prop', function() {
    wrapper.find(AutoComplete).prop('getOptionDisabled')(value);
    expect(props.getOptionDisabled.calledOnce).to.be.true;
  });

  it('should call onFocus method', function() {
    wrapper.find(AutoComplete).simulate('focus');
    expect(props.onFocus.calledOnce).to.be.true;
  });

  it('should call onBlur method', function() {
    wrapper.find(AutoComplete).simulate('blur');
    expect(props.onBlur.calledOnce).to.be.true;
  });
});
