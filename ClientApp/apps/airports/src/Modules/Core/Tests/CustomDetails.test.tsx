import React from 'react';
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { useRouterContext } from '@wings/shared';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { CustomDetails } from '../Components';
import { AirportCustomDetailStoreMock, AirportStoreMock } from '../../Shared';

describe('Airport Customs Details', () => {
  let wrapper: ReactWrapper;
  let headerActions: ShallowWrapper;

  const props = {
    title: 'Test',
    sidebarStore: SidebarStore,
    airportStore: new AirportStoreMock(),
    airportCustomDetailStore: new AirportCustomDetailStoreMock(),
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <CustomDetails {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
});
