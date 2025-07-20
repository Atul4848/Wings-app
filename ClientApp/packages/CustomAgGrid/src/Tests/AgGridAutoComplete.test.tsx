import React, { ReactNode } from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { LightTheme } from '@uvgo-shared/themes';
import { PureAgGridAutoComplete } from '../Components/AgGridAutoComplete/AgGridAutoComplete';
import { createTheme } from '@material-ui/core/styles';
import AutoComplete, { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { ISelectOption } from '@wings-shared/core';

const getOptions = (): ISelectOption[] => {
  return Array.from(Array(10)).map(
    (val, index): ISelectOption => {
      return { label: `Label ${index}`, value: index };
    }
  );
};
describe('AgGridAutoComplete', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any; // need to test private methods
  const option: ISelectOption = { label: 'Label 0', value: 0 };
  const options = getOptions();
  const theme = createTheme(LightTheme);
  const onDropDownChange = sinon.fake();
  const props = {
    theme,
    valueGetter: (selectedOption: ISelectOption | ISelectOption[]) => '',
    getAutoCompleteOptions: () => options,
    data: { value: '' },
    colDef: { field: 'value' },
    classes: { autoComplete: '' },
    cellStartedEdit: true,
    isRequired: () => true,
    context: { componentParent: { onDropDownChange } },
  };

  beforeEach(() => {
    wrapper = shallow(<PureAgGridAutoComplete {...props} />);
    wrapperInstance = wrapper.instance() as PureAgGridAutoComplete;
  });

  afterEach(() => wrapper.unmount());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
  it('should getValue', () => {
    expect(wrapperInstance.getValue()).to.eq('');
  });
  it('should isCancelAfterEnd', () => {
    expect(wrapperInstance.isCancelAfterEnd()).to.be.true;
  });
  it('should hasError', () => {
    expect(wrapperInstance.hasError).to.be.true;
    wrapper.setProps({ ...props, isRequired: false });
    expect(wrapperInstance.hasError).to.be.false;
  });

  it('should renderInput', () => {
    const inputNode: Function = wrapper.find(AutoComplete).prop('renderInput');
    expect(inputNode({ inputProps: 'test' })).not.to.be.null;
  });

  it('should renderTags', () => {
    const getTagProps: AutocompleteGetTagProps = index => {
      return { index };
    };
    const renderTags: Function = wrapper.find(AutoComplete).prop('renderTags');
    expect(renderTags(options, getTagProps).length).to.eq(11);
  });

  it('should renderTags custom', () => {
    const renderTags: Function = (values: ISelectOption[]): React.ReactNode =>
      values.map((option, index) => <span key={index}>{option.label}</span>);
    wrapper.setProps({ renderTags });
    wrapper.update();
    const renderTagNodes: Function = wrapper.find(AutoComplete).prop('renderTags');
    expect(renderTagNodes(options).length).to.eq(options.length);
  });

  it('should trigger AutoComplete change event', () => {
    const autoCompleteOnChange: Function = wrapper.find(AutoComplete).prop('onChange');
    // called with null value
    autoCompleteOnChange(null, null);
    wrapper.update();
    let selectedOption: ISelectOption = wrapperInstance.selectedOption as ISelectOption;
    expect(selectedOption).to.be.null;
    // called with single value
    autoCompleteOnChange(null, option);
    wrapper.update();
    selectedOption = wrapperInstance.selectedOption as ISelectOption;
    expect(selectedOption.value).to.eq(option.value);
    // Call with multiple values
    autoCompleteOnChange(null, options);
    wrapper.update();
    const selectedOptions = wrapperInstance.selectedOption as ISelectOption[];
    expect(selectedOptions.length).to.eq(options.length);
  });

  it('should getOptionSelected', () => {
    const getOptionSelected: Function = wrapper.find(AutoComplete).prop('getOptionSelected');
    expect(getOptionSelected(option, null)).to.be.false;
    expect(getOptionSelected(option, options)).to.be.true;
  });

  it('should getOptionLabel', () => {
    const getOptionLabel: Function = wrapper.find(AutoComplete).prop('getOptionLabel');
    expect(getOptionLabel(option)).to.eq(option.label);
    expect(getOptionLabel({ label: null })).to.eq('');
  });

  it('should getOptionDisabled', () => {
    const getOptionDisabled: Function = wrapper.find(AutoComplete).prop('getOptionDisabled');
    expect(getOptionDisabled(option)).to.be.false;
  });

  it('should return the selected option value', () => {
    const country = { id: 1, name: 'TEST', state: { name: 'TEST', city: { id: 1, name: 'TEST' } } };

    expect(wrapperInstance.getOptionValue('name', country)).equal(country.name);
    expect(wrapperInstance.getOptionValue('state.name', country)).equal(country.state.name);
    expect(wrapperInstance.getOptionValue('state.city.name', country)).equal(country.state.city.name);
  });

  it('should call onInputChange', () => {
    const onDropDownChangeSpy = sinon.spy(wrapperInstance, 'onDropDownChange');
    wrapper.setProps({ ...props, freeSolo: true });
    wrapper.find(AutoComplete).simulate('inputChange');
    expect(onDropDownChangeSpy.calledOnce).to.be.true;
  });

  it('should call TextField onFocus', () => {
    const textField: ReactNode = wrapper.find(AutoComplete).prop('renderInput')({
      id: 'TEST',
      inputProps: null,
      disabled: false,
      fullWidth: false,
      size: 'small',
      InputLabelProps: null,
      InputProps: null,
    });

    const textFieldWrapper: ShallowWrapper = shallow(<div>{textField}</div>);

    textFieldWrapper.find(TextField).simulate('focus');
    expect(wrapperInstance.showError).to.be.false;

    textFieldWrapper.find(TextField).simulate('blur');
    expect(wrapperInstance.showError).to.be.true;
  });
});
