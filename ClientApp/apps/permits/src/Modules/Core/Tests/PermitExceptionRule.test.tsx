import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import {
  PermitModel,
  RuleFilterModel,
  PermitSettingsStoreMock,
  PermitStoreMock,
  PermitExceptionRuleModel,
} from '../../Shared';
import { PermitExceptionRule } from '../Components';
import { PermitExceptionRuleViewControl } from '../Components';
import { PrimaryButton } from '@uvgo-shared/buttons';

describe('Permit Exception Rule Component', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  const permitExceptionRules = [
    new PermitExceptionRuleModel({
      ruleFilters: [new RuleFilterModel(), new RuleFilterModel({ id: 15 })],
    }),
  ];

  const props = {
    classes: {},
    permitModel: new PermitModel({ permitExceptionRules }),
    onUpdatePermitModel: sinon.spy(),
    permitSettingsStore: new PermitSettingsStoreMock(),
    permitStore: new PermitStoreMock(),
    onFocus: sinon.spy(),
    onSearch: sinon.spy(),
    onBlur: sinon.spy(),
    onValueChange: sinon.spy(),
  };

  beforeEach(() => {
    wrapper = shallow(<PermitExceptionRule {...props} />)
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

  it('should call onValueChange function', () => {
    const viewInputControl = wrapper.find(PermitExceptionRuleViewControl).at(1).props();
    viewInputControl.onValueChange('test', 'permitRequirementType');
    viewInputControl.onValueChange('test', 'name');
    viewInputControl.onValueChange('test', 'ruleValues');
    viewInputControl.onValueChange('test', 'ruleLogicalOperator');
    viewInputControl.onValueChange('test', 'ruleConditionalOperator');
    viewInputControl.onValueChange(null, 'ruleEntityType');
    viewInputControl.onValueChange(null, 'ruleField');
    viewInputControl.onValueChange('', 'delete');
  })

  it('should call onSearch function with PermitExceptionRuleViewControl', () => {
    const viewInputControlsGroup = wrapper.find(PermitExceptionRuleViewControl).at(1).props();
    viewInputControlsGroup.onSearch(null, 'Airport');
    viewInputControlsGroup.onSearch(null, 'State');
  });

  it('should call onFocus function with PermitExceptionRuleViewControl', () => {
    const viewInputControlsGroup = wrapper.find(PermitExceptionRuleViewControl).at(1).props();
    viewInputControlsGroup.onFocus(null, 'Country');
    viewInputControlsGroup.onFocus(null, 'Region');
    viewInputControlsGroup.onFocus(null, 'FARType');
    viewInputControlsGroup.onFocus(null, 'PurposeOfFlight');
    viewInputControlsGroup.onFocus(null, 'NoiseChapter');
    viewInputControlsGroup.onFocus(null, 'FIR');
    viewInputControlsGroup.onFocus(null, 'AircraftCategory');
    viewInputControlsGroup.onFocus(null, 'ICAOAerodromeReferenceCode');
    viewInputControlsGroup.onFocus(null, 'CrossingType');
    viewInputControlsGroup.onFocus(null, 'AirportOfEntry');
  });

  it('should call onBlur function with PermitExceptionRuleViewControl', () => {
    const viewInputControlsGroup = wrapper.find(PermitExceptionRuleViewControl).at(1).props();
    viewInputControlsGroup.onBlur(null, 'Airport');
  });

  it('should add the new type on add button click', () => {
    wrapper
      .find(PrimaryButton)
      .props()
      .onClick();
  });
});
