import React from 'react';
import { mount, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { VIEW_MODE, useRouterContext } from '@wings/shared';
import AirportGeneralInformation from '../Components/AirportGeneralInformation/AirportGeneralInformationV2';
import { AirportStoreMock, AirportSettingsStoreMock, EntityMapStoreMock } from '../../Shared';
import { SidebarStore } from '@wings-shared/layout';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('AirportGeneralInformationV2 Module', () => {
  let wrapper: any;
  let headerActions: ShallowWrapper;

  const props = {
    airportStore: new AirportStoreMock(),
    entityMapStore: new EntityMapStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    sidebarStore: SidebarStore,
    params: { viewMode: VIEW_MODE },
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <AirportGeneralInformation {...props} />
    </ThemeProvider>
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
