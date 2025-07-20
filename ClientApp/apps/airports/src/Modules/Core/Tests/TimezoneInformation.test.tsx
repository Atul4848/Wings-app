import * as React from 'react';
import { ReactWrapper, mount } from 'enzyme';
import { expect } from 'chai';
import { useRouterContext } from '@wings/shared';
import { SidebarStore } from '@wings-shared/layout';
import { TimezoneInformation } from '../Components';
import { LightTheme } from '@uvgo-shared/themes';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { AirportModel, AirportTimeZoneInformationModel, AirportTimezoneModel } from '../../Shared';

describe('TimezoneInformation Module', () => {
  let wrapper: ReactWrapper;

  const props = {
    airport: new AirportModel({
      id: 1,
      name: 'TEST',
      timezoneInformation: new AirportTimezoneModel({
        local: new AirportTimeZoneInformationModel(),
        currentTime: new AirportTimeZoneInformationModel(),
        sdt: new AirportTimeZoneInformationModel(),
        dst: new AirportTimeZoneInformationModel(),
        hasDst: false,
      }),
    }),
    sidebarStore: SidebarStore,
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <TimezoneInformation {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.lengthOf(1);
  });
});
