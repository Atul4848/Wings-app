import * as React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { PermitExceptionMasterDetails } from '../Components';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { PermitExceptionRuleModel, RuleFilterModel, RuleValueModel } from '../../Shared';
import { SettingsTypeModel } from '@wings-shared/core';

describe('Permit Exception Master Details Component', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(
      <PermitExceptionMasterDetails
        data={
          new PermitExceptionRuleModel({
            ruleFilters: [
              new RuleFilterModel({
                ruleLogicalOperator: new SettingsTypeModel({ id: 1, name: 'And' }),
                ruleEntityType: new SettingsTypeModel({ id: 1, name: 'Trip' }),
                ruleField: new SettingsTypeModel({ id: 1, name: 'ArrivalCountry' }),
                ruleConditionalOperator: new SettingsTypeModel({ id: 1, name: 'EqualTo' }),
                ruleValues: [
                  new RuleValueModel({ id: 1, code: 'TEST', ruleValue: 1 }),
                  new RuleValueModel({ id: 1, ruleValue: 'TEST' }),
                ],
              }),
            ],
          })
        }
      />
    )
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render CustomAgGridReact', () => {
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
  });
});
