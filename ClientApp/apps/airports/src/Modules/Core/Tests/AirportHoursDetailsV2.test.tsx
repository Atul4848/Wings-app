import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { expect } from 'chai';
import { AirportHoursStoreMock, AirportSettingsStoreMock, AirportStoreMock } from '../../Shared';
import { AirportHoursDetails } from '../Components';
import { CommonAirportHoursGrid } from '../../AirportHours/Components';
import sinon from 'sinon';
import { AgGridTestingHelper, useRouterContext } from '@wings/shared';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { SidebarStore } from '@wings-shared/layout';

describe('Airport Hour Details Component of Airports', () => {
  let wrapper: ReactWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    airportStore: new AirportStoreMock(),
    airportHoursStore: new AirportHoursStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    sidebarStore: SidebarStore,
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <AirportHoursDetails {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CommonAirportHoursGrid)).to.have.length(1);
  });
});
