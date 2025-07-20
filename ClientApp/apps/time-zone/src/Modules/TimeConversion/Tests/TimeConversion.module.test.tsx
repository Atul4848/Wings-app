
import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { useRouterContext } from '@wings/shared';
import { SidebarStore } from '@wings-shared/layout';
import { TimeZoneStoreMock } from '../../Shared';
import TimeConversionModule from '../TimeConversion.module';

describe('Time Conversion Module', () => {
  let wrapper: any;
  const store = new TimeZoneStoreMock();

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <TimeConversionModule timeZoneStore={store} sidebarStore={SidebarStore}/>
    </ThemeProvider>
  );

  const reRender = () => wrapper.setProps({ abc: Math.random() });

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });


});

