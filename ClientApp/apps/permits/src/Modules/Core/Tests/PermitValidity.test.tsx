import React from 'react';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper, useRouterContext } from '@wings/shared';
import { DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { GRID_ACTIONS } from '@wings-shared/core';
import { AgGridMasterDetails, CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { PermitSettingsStoreMock, PermitStoreMock } from '../../Shared';
import { PermitValidity } from '../Components';

describe('Permit Validity Component', () => {
  let wrapper: any;
  let headerActions: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    sidebarStore: SidebarStore,
    permitSettingsStore: new PermitSettingsStoreMock(),
    permitStore: new PermitStoreMock(),
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <PermitValidity {...props} />
    </ThemeProvider>
  );
  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    ModalStore.data = null;
  });

  it('should be rendered without errors, render CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(headerActions).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should start row editing ', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should stop row editing on cancel ', () => {
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    parentComp.onInputChange({ colDef: { field: 'flightOperationalCategory' } } as any, '');
  });

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    parentComp.onDropDownChange({ colDef: { field: 'flightOperationalCategory' } } as any, null);
  });

  it('should add the new type on add button click', () => {
    wrapper
      .find(AgGridMasterDetails)
      .props()
      .onAddButtonClick();
  });

  it('should call upsert function on save button click', () => {
      agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
      expect(props.permitSettingsStore.upsertPermitValidity).to.be.ok;
  });

  it('should call upsert function on delete button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.DELETE, 1);
    expect(props.permitSettingsStore.removePermitValidity).to.be.ok;
  });
  
});

