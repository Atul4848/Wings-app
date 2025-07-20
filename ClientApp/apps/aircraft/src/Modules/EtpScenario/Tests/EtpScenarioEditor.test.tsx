import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { useRouterContext, VIEW_MODE } from '@wings/shared';
import {
  EtpScenarioDetailModel,
  EtpScenarioStoreMock,
  EtpSettingsStoreMock,
  SettingsStoreMock,
} from '../../Shared';
import { EtpScenarioEditor } from '../Components';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { Provider } from 'mobx-react';
import { ViewInputControl } from '@wings-shared/form-controls';
import { LightTheme } from '@uvgo-shared/themes';

describe('Etp Scenario Editor', () => {
  let wrapper;
  const etpScenarioStore = new EtpScenarioStoreMock();
  const etpSettingsStore = new EtpSettingsStoreMock();
  const settingsStore = new SettingsStoreMock();
  const etpScenarioDetailModel = new EtpScenarioDetailModel({
    id: 1,
  });

  const props = {
    etpScenarioDetailModel,
    etpScenarioStore,
    etpSettingsStore,
    settingsStore,
    viewMode: VIEW_MODE.NEW,
    onChange: sinon.spy(),
  };
  const element = (
    <Provider {...props}>
      <ThemeProvider theme={createTheme(LightTheme)}>
        <EtpScenarioEditor {...props} />
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

  it('should call onValueChange function', () => {
    const viewInputControl = wrapper.find(ViewInputControl);
    viewInputControl
      .at(1)
      .props()
      .onValueChange(false, 'etpInitialDescent');
    viewInputControl
      .at(0)
      .props()
      .onValueChange(true, 'cruiseEtpProfile');
    viewInputControl
      .at(3)
      .props()
      .onValueChange(true, 'etpFinalDescentBurn');
    viewInputControl
      .at(3)
      .props()
      .onValueChange(false, 'etpHold');
      viewInputControl
      .at(3)
      .props()
      .onValueChange(false, 'etpApuBurn');
  });
 
});
