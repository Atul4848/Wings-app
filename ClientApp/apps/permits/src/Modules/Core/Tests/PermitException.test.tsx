import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { PermitExceptionRuleModel, PermitModel, PermitSettingsStoreMock, PermitStoreMock, RuleFilterModel } from '../../Shared';
import { useRouterContext } from '@wings/shared';
import { PermitException } from '../Components';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('Permit Exception Component', () => {
  let wrapper: any;

  const permit: PermitModel = new PermitModel({
    name: 'Test',
    permitExceptionRules: [
      new PermitExceptionRuleModel({
        ruleFilters: [new RuleFilterModel()],
      }),
    ],
  });

  const props = {
    classes: {},
    permitModel: permit,
    onUpdatePermitModel: sinon.spy(),
    hasPermitExceptionRuleError: false,
    permitSettingsStore: new PermitSettingsStoreMock(),
    permitStore: new PermitStoreMock(), 
  };

  const element = (
      <ThemeProvider theme={createTheme(LightTheme)}>
        <PermitException {...props} />
      </ThemeProvider>
    );
  
  beforeEach(() => {
   wrapper = mount(useRouterContext(element));
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, render CustomAgGridReacts', () => {
    expect(wrapper).to.be.ok;
  });

});
