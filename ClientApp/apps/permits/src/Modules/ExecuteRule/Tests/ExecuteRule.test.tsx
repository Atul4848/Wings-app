import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { PermitSettingsStoreMock, PermitStoreMock } from '../../Shared';
import { useRouterContext } from '../../../../../shared';
import { createTheme, ThemeProvider } from '@material-ui/core';
import ExecuteRule from '../ExecuteRule';
import { Provider } from 'mobx-react';
import { LightTheme } from '@uvgo-shared/themes';

describe('Execute Rule Component V2', () => {
  let wrapper: any;

  const props = {
    classes: {},
    permitStore: new PermitStoreMock(),
    permitSettingsStore: new PermitSettingsStoreMock(),
  };
  const element = (
    <Provider {...props}>
      <ThemeProvider theme={createTheme(LightTheme)}>
        <ExecuteRule {...props} />
      </ThemeProvider>
    </Provider>
  );
  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

});
