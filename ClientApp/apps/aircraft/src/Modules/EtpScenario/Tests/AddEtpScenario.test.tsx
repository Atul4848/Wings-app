
import * as React from 'react';
import { ReactWrapper, mount } from 'enzyme';
import {
  EtpScenarioStoreMock,
  EtpSettingsStoreMock,
  SettingsStoreMock,
} from '../../Shared';
import { expect } from 'chai';
import { useRouterContext } from '@wings/shared';
import { SidebarStore } from '@wings-shared/layout';
import  AddEtpScenario from '../Components/AddEtpScenario/AddEtpScenario';
import { LightTheme } from '@uvgo-shared/themes';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { ModalStore } from '@uvgo-shared/modal-keeper';

describe('Add Etp Scenario Module', () => {
  let wrapper: ReactWrapper;

  const props = {
    classes: {},
    etpScenarioStore: new EtpScenarioStoreMock(),
    etpSettingsStore: new EtpSettingsStoreMock(),
    settingsStore: new SettingsStoreMock(),
    sidebarStore:SidebarStore
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <AddEtpScenario {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
  });

  afterEach(() => {
    wrapper.unmount();
    ModalStore.data = null;
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});


