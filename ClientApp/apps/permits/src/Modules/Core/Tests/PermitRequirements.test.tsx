import React from 'react';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { PermitSettingsStoreMock, PermitStoreMock } from '../../Shared';
import PermitRequirements from '../Components/PermitRequirements/PermitRequirements';
import { AgGridTestingHelper, useRouterContext, VIEW_MODE } from '@wings/shared';
import { DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('Permit Requirements Component', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;
  let headerActions: ShallowWrapper;

  const props = {
    sidebarStore: SidebarStore,
    permitStore: new PermitStoreMock(),
    permitSettingsStore: new PermitSettingsStoreMock(),
    fields:'test',
    params: { mode: VIEW_MODE.EDIT, id: 1 },
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <PermitRequirements {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper)}</div>);
    agGridHelper = new AgGridTestingHelper(wrapper, true);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, render CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(headerActions).to.be.ok;
  });

});
