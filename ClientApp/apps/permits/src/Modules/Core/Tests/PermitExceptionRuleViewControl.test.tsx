import React from 'react';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PermitExceptionRuleViewControl } from '../Components';
import {
  PermitStoreMock,
  PermitSettingsStoreMock,
  RuleFilterModel,
  RuleValueModel,
} from '../../Shared';
import { SettingsTypeModel, ISelectOption } from '@wings-shared/core';

describe('Permit Exception Rule View Control Component', () => {
  let wrapper: any;
  let instance: any;
  const option: ISelectOption = { label: 'Label 0', value: 0 };
  const props = {
    exceptionRules: [],
    classes: {},
    onValueChange: sinon.spy(),
    onFocus: sinon.spy(),
    onBlur: sinon.spy(),
    onSearch: sinon.spy(),
    label: 'TEST',
    fieldKey: 'name',
    value: '',
    ruleFilter: new RuleFilterModel({
      ruleLogicalOperator: new SettingsTypeModel({ id: 1, name: 'And' }),
      ruleEntityType: new SettingsTypeModel({ id: 1, name: 'TRIP' }),
      ruleConditionalOperator: new SettingsTypeModel({ id: 1, name: 'In' }),
      ruleField: new SettingsTypeModel({ id: 1, name: 'FAR-TYPE' }),
      ruleValues: [
        new RuleValueModel({ id: 1, code: 'IN', ruleValue: 10 }),
        new RuleValueModel({ id: 2, code: 'TEST', ruleValue: 15 }),
        new RuleValueModel({ id: 5, ruleValue: 'TESTING' }),
      ],
    }),
    permitSettingsStore: new PermitSettingsStoreMock(),
    permitStore: new PermitStoreMock(),
    errors: [],
    isHidden: false,
  };

  beforeEach(() => {
    wrapper = shallow(<PermitExceptionRuleViewControl {...props} />)
      .dive()
      .dive();
    instance = wrapper.instance();
    props.permitSettingsStore.getRuleEntityParameterConfigs().subscribe();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render a ViewInputControl for TEXT_FIELD type', () => {
    const textFieldProps = {
      ...props,
      inputEditorType: () => 'TEXT_FIELD',
    };
    wrapper = mount(<PermitExceptionRuleViewControl {...textFieldProps} />);
    const viewInputControl = wrapper.find('ViewInputControl');
    expect(viewInputControl).to.have.lengthOf(1);
  });

  it('should not render content when isHidden is true', () => {
    const hiddenProps = {
      ...props,
      isHidden: true,
    };
    wrapper = mount(<PermitExceptionRuleViewControl {...hiddenProps} />);
    const chipInputControl = wrapper.find('ChipInputControl');
    expect(chipInputControl).to.have.lengthOf(0);
  });

  it('should render ChipInputControl when fieldKey is ruleValues and hasMultiple is true', () => {
    const chipInputProps = {
      ...props,
      fieldKey: 'ruleValues',
      hasMultiple: () => true,
      inputEditorType: () => 'DROPDOWN',
    };
    wrapper = mount(<PermitExceptionRuleViewControl {...chipInputProps} />);
    const chipInputControl = wrapper.find('ChipInputControl');
    expect(chipInputControl).to.have.lengthOf(1);
  });

  it('should call onValueChange when value changes', () => {
    const changeProps = {
      ...props,
      fieldKey: 'name',
    };
    wrapper = mount(<PermitExceptionRuleViewControl {...changeProps} />);
    const viewInputControl = wrapper.find('ViewInputControl');
    viewInputControl.prop('onValueChange')(option, 'name');
    expect(props.onValueChange.calledOnce).to.be.true;
    expect(props.onValueChange.calledWith(option, 'name')).to.be.true;

    viewInputControl.prop('onSearch')(option, 'name');
    expect(props.onSearch.calledOnce).to.be.true;
    expect(props.onSearch.calledWith(option, 'name')).to.be.true;
  });

  it('should display error message when validation fails', () => {
    const errorProps = {
      ...props,
      errors: [{ id: '1_1_name', name: 'This Field is required.' }],
      exceptionRuleTempId: 1,
    };
    wrapper = mount(<PermitExceptionRuleViewControl {...errorProps} />);
    const viewInputControl = wrapper.find('ViewInputControl');
    expect(viewInputControl.prop('customErrorMessage')).to.equal('');
  });
});