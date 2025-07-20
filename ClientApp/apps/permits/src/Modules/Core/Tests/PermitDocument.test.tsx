import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { AgGridTestingHelper, useRouterContext, VIEW_MODE } from '@wings/shared';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { GRID_ACTIONS, IdNameCodeModel } from '@wings-shared/core';
import { CollapsibleWithButton, SidebarStore } from '@wings-shared/layout';
import PermitDocument from '../Components/PermitRequirements/PermitDocument';
import { PermitDocumentModel, PermitSettingsStoreMock, PermitStoreMock } from '../../Shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';

describe('PermitDocument module', () => {
  let wrapper: ReactWrapper;
  let agGridHelper: AgGridTestingHelper;

  const permit: PermitDocumentModel = new PermitDocumentModel({
    id: 1,
    document: new IdNameCodeModel({ id: 1, name: 'test', code: 'tst' }),
  });

  const props = {
    params: { id: 1, viewMode: VIEW_MODE.EDIT },
    isEditable: true,
    sidebarStore: SidebarStore,
    permitStore: new PermitStoreMock(),
    permitSettingsStore: new PermitSettingsStoreMock(),
    onDataSave: sinon.fake(),
    onRowEditing: sinon.spy(),
    permitDocuments: permit,
    onDropdownChange: sinon.spy(),
    onInputChange: sinon.spy(),
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <PermitDocument {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, render CustomAgGridReacts', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should start row editing ', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).true;
  });

  it('should stop row editing on cancel ', () => {
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should add the new type on add button click', () => {
    wrapper
      .find(CollapsibleWithButton)
      .props()
      .onButtonClick();
  });

  it('should call onDropdownChange with correct parameters', () => {
    const dropdownParams = { colDef: { field: 'ruleEntityType' } };
    const value = { id: 1, name: 'test' };
    props.onDropdownChange(dropdownParams, value);
    expect(props.onDropdownChange.calledWith(dropdownParams, value)).to.be.true;
  });

  it('should call onInputChange with correct parameters', () => {
    const inputParams = { colDef: { field: 'ruleField' } };
    const value = 'Test Input';
    props.onInputChange(inputParams, value);
    expect(props.onInputChange.calledWith(inputParams, value)).to.be.true;
  });
});
