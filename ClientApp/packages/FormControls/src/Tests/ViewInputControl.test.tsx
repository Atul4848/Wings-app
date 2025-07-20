import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { MobxReactForm } from 'mobx-react-form';
import { Checkbox, FormControlLabel, FormLabel, TextField, IconButton } from '@material-ui/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { getFormValidation } from '@wings-shared/core';
import { EDITOR_TYPES } from '../Enums';
import {
  AutoCompleteControl,
  DateTimePicker,
  RichTextEditor,
  SelectControl,
  ViewInputControl as PureViewInputControl,
  InputMaximizeLabel,
  SimpleMarkdownEditor,
  LatLongEditor,
} from '../Components';
import { InfoComponent } from '@wings-shared/layout';

describe('ViewInputControl Module', function() {
  let wrapper: ShallowWrapper;
  let instance: any;
  let wrapperInstance;
  const form: MobxReactForm = getFormValidation({
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
  });

  const props = {
    classes: {},
    isEditable: true,
    type: EDITOR_TYPES.DROPDOWN,
    isDisabled: true,
    showTooltip: false,
    onValueChange: sinon.fake(),
    field: form.$('testField'),
    fieldKey: '',
    isInputCustomLabel: false,
    onLabelClick: sinon.fake(),
    onFocus: sinon.fake(),
    onBlur: sinon.fake(),
  };

  beforeEach(function() {
    wrapper = shallow(<PureViewInputControl {...props} field={form.$('testField')} />).dive();
    instance = wrapper.instance();
    form.$('testField').set('');
    wrapperInstance = wrapper.instance();
  });

  afterEach(function() {
    return sinon.resetHistory();
  });

  const setFormValue = (type: EDITOR_TYPES, formValue: string | boolean | object) => {
    form.$('testField').set(formValue);
    wrapper.setProps({ ...props, type });
  };

  it('should be rendered without errors', function() {
    //editable = true
    expect(wrapper).to.have.length(1);

    //editable = false
    wrapper.setProps({ ...props, isEditable: false });
    expect(wrapper).to.have.length(1);
  });
  it('should call popover on endAdornment click', function() {
    const onEndAdornmentClickSpy = sinon.spy(wrapperInstance, 'onEndAdornmentClick');
    wrapperInstance.onEndAdornmentClick({ currentTarget: <div /> });
    expect(onEndAdornmentClickSpy.calledOnce).to.be.true;
  });

  it('should call onValueChange on DROPDOWN value change', function() {
    const value = { value: '1', label: 'Test-A' };
    wrapper.setProps({ ...props, type: EDITOR_TYPES.DROPDOWN, dropDownValue: 'Test-A' });
    wrapper.find(AutoCompleteControl).simulate('dropDownChange', value);
    expect(props.onValueChange.calledWith(value, 'testField')).to.be.true;
  });

  it('should call onValueChange onCHECKBOX value change', function() {
    wrapper.setProps({ ...props, checked: false, type: EDITOR_TYPES.CHECKBOX });
    wrapper
      .find(FormControlLabel)
      .dive()
      .dive()
      .find(Checkbox)
      .simulate('change', null, true);
    expect(props.onValueChange.calledWith(true, 'testField')).to.be.true;
  });

  it('should call onValueChange on TEXT_FIELD value change', function() {
    const value = '11';
    wrapper.setProps({ ...props, type: EDITOR_TYPES.TEXT_FIELD });
    wrapper.find(TextField).simulate('change', { target: { value } });
    expect(props.onValueChange.calledWith(value, 'testField')).to.be.true;
  });

  it('should call onValueChange on TEXT_FIELD value change', function() {
    wrapper.setProps({ ...props, type: EDITOR_TYPES.TEXT_FIELD });
    wrapper.find(TextField).simulate('blur');
    expect(form.$('testField').showError).to.be.true;
  });

  it('should call onValueChange on DATE_TIME value change', function() {
    const value = '2020-11-11';
    wrapper.setProps({ ...props, type: EDITOR_TYPES.DATE_TIME });
    wrapper.find(DateTimePicker).simulate('change', value, {
      isValid: () => true,
      set: () => {
        return { format: () => value };
      },
    });
    expect(props.onValueChange.calledWith(value, 'testField')).to.be.true;
  });

  it('should render TIME', function() {
    const value = '2020-11-11';
    wrapper.setProps({ ...props, type: EDITOR_TYPES.TIME });
    wrapper.find(DateTimePicker).simulate('change', value, {
      isValid: () => true,
      set: () => {
        return { format: () => value };
      },
    });
    expect(props.onValueChange.calledWith(value, 'testField')).to.true;
  });

  it('should render proper value for checkbox', function() {
    setFormValue(EDITOR_TYPES.CHECKBOX, false);
    expect(instance.fieldValue).to.be.equal('No');

    setFormValue(EDITOR_TYPES.CHECKBOX, true);
    expect(instance.fieldValue).to.be.equal('Yes');
  });

  it('should render proper value for TEXT_FIELD', function() {
    setFormValue(EDITOR_TYPES.TEXT_FIELD, '');
    expect(instance.fieldValue).to.be.equal('-');

    // empty value
    setFormValue(EDITOR_TYPES.TEXT_FIELD, 'TEST');
    expect(instance.fieldValue).to.be.equal('TEST');
  });

  it('should render proper value for DATE_TIME', function() {
    setFormValue(EDITOR_TYPES.DATE_TIME, '');
    expect(instance.fieldValue).to.be.equal('-');

    setFormValue(EDITOR_TYPES.DATE_TIME, '2020-11-11');
    expect(instance.fieldValue).to.be.equal('11-Nov-2020');
  });

  it('should render proper value for TIME', function() {
    setFormValue(EDITOR_TYPES.TIME, '');
    expect(instance.fieldValue).to.be.equal('-');
  });

  it('should render proper default value', function() {
    setFormValue(null, '');
    expect(instance.fieldValue).to.be.equal('-');
  });

  it('should return value with getDropdownValue', function() {
    setFormValue(EDITOR_TYPES.DROPDOWN, null);
    expect(instance.fieldValue).to.be.equal('-');

    setFormValue(EDITOR_TYPES.DROPDOWN, { value: '1', label: 'Test-A' });
    expect(instance.fieldValue).to.be.equal('Test-A');
  });

  it('should render PrimaryButton with type Button', function() {
    setFormValue(EDITOR_TYPES.BUTTON, null);
    const button = wrapper.find(PrimaryButton);
    button.simulate('click');
    expect(button).to.be.ok;
    expect(props.onValueChange.calledWith(null, 'testField')).to.true;
  });

  it('should call renderTags', function() {
    const value = [{ value: '1', label: 'Test-A' }];
    const renderTags = sinon.spy();
    wrapper.setProps({ ...props, type: EDITOR_TYPES.DROPDOWN, dropDownValue: 'Test-A', renderTags });
    wrapper.find(AutoCompleteControl).prop('renderTags')(value, sinon.spy());
    expect(renderTags.called).to.be.true;
  });

  it('should call getOptionDisabled on value selected', function() {
    const value = { value: '1', label: 'Test-A' };
    const getOptionDisabled = sinon.spy();
    wrapper.setProps({ ...props, type: EDITOR_TYPES.DROPDOWN, dropDownValue: 'Test-A', getOptionDisabled });
    wrapper.find(AutoCompleteControl).prop('getOptionDisabled')(value, [value]);
    expect(getOptionDisabled.called).to.be.true;
  });

  it('should call onLabelClick on click of expand icon', function() {
    wrapper.setProps({ ...props, type: EDITOR_TYPES.RICH_TEXT_EDITOR, isDisabled: false });
    wrapper.find(RichTextEditor).simulate('labelClick');
    expect(props.onLabelClick.called).to.be.true;
  });

  it('should call onValueChange on RichTextEditor input change', function() {
    wrapper.setProps({ ...props, type: EDITOR_TYPES.RICH_TEXT_EDITOR, isDisabled: false });
    wrapper.find(RichTextEditor).simulate('valueChange');
    expect(props.onValueChange.called).to.be.true;
  });

  it('should call onChange on boolean autocomplete input change', function() {
    wrapper.setProps({ ...props, type: EDITOR_TYPES.SELECT_CONTROL, isDisabled: false });
    wrapper.find(SelectControl).simulate('valueChange');
    expect(props.onValueChange.called).to.be.true;
  });
  it('should call onFocus on autoComplete', function() {
    const autoCompleteComponent = wrapper.find(AutoCompleteControl);
    autoCompleteComponent.simulate('focus');
    expect(props.onFocus.called).to.be.true;
  });
  it('should call onBlur on autoComplete', function() {
    const autoCompleteComponent = wrapper.find(AutoCompleteControl);
    autoCompleteComponent.simulate('blur');
    expect(props.onBlur.called).to.be.true;
  });
  it('should call onFocus on richTextEditor', function() {
    wrapper.setProps({ ...props, type: EDITOR_TYPES.RICH_TEXT_EDITOR, isDisabled: false });
    const richTextEditorComponent = wrapper.find(RichTextEditor);
    richTextEditorComponent.simulate('focus');
    expect(props.onFocus.called).to.be.true;
  });

  it('should call onBlur on dateTimePicker', function() {
    wrapper.setProps({ ...props, type: EDITOR_TYPES.DATE_TIME, isDisabled: false });
    const dateTimePickerComponent = wrapper.find(DateTimePicker);
    dateTimePickerComponent.simulate('blur');
    expect(props.onBlur.called).to.be.true;
  });
  it('should call onFocus on dateTimePicker', function() {
    wrapper.setProps({ ...props, type: EDITOR_TYPES.DATE_TIME, isDisabled: false });
    const dateTimePickerComponent = wrapper.find(DateTimePicker);
    dateTimePickerComponent.simulate('focus');
    expect(props.onFocus.called).to.be.true;
  });
  it('should render InputMaximizeLabel if isInputCustomLabel', function() {
    wrapper.setProps({ ...props, isEditable: false, isInputCustomLabel: true });
    const inputMaximizeLabel = wrapper.find(InputMaximizeLabel);
    expect(inputMaximizeLabel).to.have.length(1);
  });
  it('should render InfoComponent  if isInputCustomLabel and showTooltip ', function() {
    wrapper.setProps({ ...props, isEditable: false, isInputCustomLabel: true, showTooltip: true });
    const infoComponent = wrapper.find(InfoComponent);
    expect(infoComponent).to.have.length(1);
  });
  it('should render FormLabel', function() {
    wrapper.setProps({ ...props, type: EDITOR_TYPES.LABEL });
    const formLabelComponent = wrapper.find(FormLabel);
    expect(formLabelComponent).to.have.length(1);
  });
  it('should call onValueChange on AutoCompleteControl value change', function() {
    wrapper.setProps({ ...props, type: EDITOR_TYPES.DROPDOWN });
    const autoCompleteControl = wrapper.find(AutoCompleteControl);
    autoCompleteControl.simulate('dropDownChange', { value: '1', label: 'New option' });
    expect(props.onValueChange.calledWith({ value: '1', label: 'New option' }, 'testField')).to.be.true;
  });
  it('should call onValueChange on SelectControl value change', function() {
    wrapper.setProps({ ...props, type: EDITOR_TYPES.SELECT_CONTROL });
    const selectControl = wrapper.find(SelectControl);
    selectControl.simulate('valueChange', 'New value', 'testField');
    expect(props.onValueChange.calledWith('New value', 'testField')).to.be.true;
  });
  it('should call onValueChange on RichTextEditor content change', function() {
    wrapper.setProps({ ...props, type: EDITOR_TYPES.RICH_TEXT_EDITOR });
    const richTextEditor = wrapper.find(RichTextEditor);
    richTextEditor.simulate('valueChange', 'New content', 'testField');
    expect(props.onValueChange.calledWith('New content', 'testField')).to.be.true;
  });
  it('should call onValueChange with null on BUTTON click', function() {
    setFormValue(EDITOR_TYPES.BUTTON, null);
    const button = wrapper.find(PrimaryButton);
    button.simulate('click');
    expect(button).to.be.ok;
    expect(props.onValueChange.calledWith(null, 'testField')).to.be.true;
  });
  it('should render SimpleMarkdownEditor component for MARKDOWN_EDITOR type', function() {
    setFormValue(EDITOR_TYPES.MARKDOWN_EDITOR, 'Markdown content');
    const markdownEditor = wrapper.find(SimpleMarkdownEditor);
    expect(markdownEditor).to.have.length(1);
  });
  it('should call onCustomButtonClick on BUTTON click', function() {
    wrapper.setProps({ ...props, type: EDITOR_TYPES.BUTTON });
    wrapper.find(PrimaryButton).simulate('click');
    expect(props.onValueChange.calledWith(null, 'testField')).to.be.true;
  });
  it('should show error message on TEXT_FIELD blur with invalid input', function() {
    wrapper.setProps({ ...props, type: EDITOR_TYPES.TEXT_FIELD });
    wrapper.find(TextField).simulate('change', { target: { value: 'invalid_input' } });
    wrapper.find(TextField).simulate('blur');
    expect(form.$('testField').showError).to.be.true;
  });
  it('should call onValueChange with proper value on LatLongEditor confirm', function () {
    wrapper.setProps({ ...props, type: EDITOR_TYPES.TEXT_FIELD, isLatLongEditor: true });
    instance.showLatLongEditor = true; // Open the LatLongEditor
    wrapper.find(LatLongEditor).prop('onOkClick')({ latitude: 12.34, longitude: 56.78 });
    expect(props.onValueChange.calledWith({ latitude: 12.34, longitude: 56.78 }, 'testField')).to.be.true;
  });
});
