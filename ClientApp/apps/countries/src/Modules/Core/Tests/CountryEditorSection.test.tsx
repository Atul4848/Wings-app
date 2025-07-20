import * as React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { getFormValidation, ISelectOption } from '@wings-shared/core';
import { CountryEditorSection } from '../Components';
import MobxReactForm from 'mobx-react-form';
import { AutoCompleteControl, EDITOR_TYPES } from '@wings-shared/form-controls';
import sinon from 'sinon';

describe('CountryEditorSection', () => {
  let wrapper: any;
  let testFormField;

  const fields = {
    testField: {
      label: 'Test field label',
      placeholder: 'Test field placeholder',
      rules: 'required|string',
      value: 'Test value',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
  };
  const form: MobxReactForm = getFormValidation(fields);

  const props = {
    field: form.$('testField'),
    type: EDITOR_TYPES.DROPDOWN,
    isEditable: true,
  };

  beforeEach(() => {
    wrapper = shallow(<CountryEditorSection {...props} />);
    testFormField = form.$('testField');
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should be rendered without errors for isEditable as false', () => {
    form.$('testField').set(true);
    wrapper.setProps({ isEditable: false, field: form.$('testField'), type: EDITOR_TYPES.CHECKBOX });
    expect(wrapper).to.have.length(1);
  });

  it('should render dropdown change', () => {
    form.$('testField').set(true);
    const caller = sinon.spy((option: ISelectOption, fieldKey: string) => '');
    wrapper.setProps({
      type: EDITOR_TYPES.DROPDOWN,
      onDropdownChange: caller,
      dropDownValue: 'Test-A',
      isEditable: true,
    });

    wrapper.find(AutoCompleteControl).prop('onDropDownChange')({ value: 1, label: '' }, 'testField');
    expect(caller.called).to.true;
  });

  it('should render focus change', () => {
    form.$('testField').set(true);
    const caller = sinon.spy((fieldKey: string) => '');
    wrapper.setProps({
      type: EDITOR_TYPES.DROPDOWN,
      onFocus: caller,
      isEditable: true,
    });

    wrapper.find(AutoCompleteControl).prop('onFocus')('testField');
    expect(caller.called).to.true;
  });

  it('should called on search', () => {
    form.$('testField').set(true);
    const caller = sinon.spy((searchValue: string) => '');
    wrapper.setProps({
      type: EDITOR_TYPES.DROPDOWN,
      onSearch: caller,
      isEditable: true,
    });

    wrapper.find(AutoCompleteControl).prop('onSearch')('test');
    expect(caller.called).to.true;
  });

  it('should render threat level', () => {
    wrapper.setProps({
      type: EDITOR_TYPES.THREAT_LEVEL,
      isEditable: true,
    });
    expect(wrapper).to.have.length(1);
  });

  it('should render default type', () => {
    wrapper.setProps({
      type: '',
      isEditable: true,
    });
    expect(wrapper).to.have.length(1);
  });

  it('should render checkbox', () => {
    wrapper.setProps({
      type: EDITOR_TYPES.CHECKBOX,
      isEditable: true,
    });
    expect(wrapper).to.have.length(1);
  });

  it('should render datetime picker', () => {
    wrapper.setProps({
      type: EDITOR_TYPES.DATE_TIME,
      isEditable: true,
    });
    expect(wrapper).to.have.length(1);
  });

  it('should render textfield', () => {
    wrapper.setProps({
      type: EDITOR_TYPES.TEXT_FIELD,
      isEditable: true,
    });
    expect(wrapper).to.have.length(1);
  });
});
