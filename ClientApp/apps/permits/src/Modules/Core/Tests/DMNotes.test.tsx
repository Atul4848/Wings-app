import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { PermitSettingsStoreMock, PermitStoreMock } from '../../Shared';
import { useRouterContext, VIEW_MODE } from '@wings/shared';
import { SidebarStore } from '@wings-shared/layout';
import { DMNotes } from '../Components';
import { Provider } from 'mobx-react';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('DMNotes Component V2', () => {
  let wrapper: any;

  const props = {
    sidebarStore: SidebarStore,
    permitSettingsStore: new PermitSettingsStoreMock(),
    permitStore: new PermitStoreMock(),
  };

  const element = (
    <Provider {...props}>
      <ThemeProvider theme={createTheme(LightTheme)}>
        <DMNotes {...props} />
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
    expect(wrapper).to.have.length(1);
  });

});
