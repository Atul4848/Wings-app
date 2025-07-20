import React from 'react';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { PermitLeadTimeModel, PermitModel, PermitSettingsStoreMock, PermitStoreMock } from '../../Shared';
import PermitLeadTimesUpsert from '../Components/PermitLeadTimesUpsert/PermitLeadTimesUpsert';
import { AgGridTestingHelper, useRouterContext, VIEW_MODE } from '@wings/shared';
import { AgGridMasterDetails, CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { PermitEditorActions } from '../Components';

describe('Permit Lead Times Upsert Component', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;
  let headerActions: ShallowWrapper;

  const permit: PermitModel = new PermitModel({
    id: 1,
    name: 'Test',
    permitLeadTimes: [new PermitLeadTimeModel()],
  });

  const props = {
    classes: {},
    permitModel: permit,
    onUpdatePermitModel: sinon.spy(),
    isEditable: false,
    navigate: sinon.spy(),
    sidebarStore: SidebarStore,
    permitStore: new PermitStoreMock(),
    permitSettingsStore: new PermitSettingsStoreMock(),
    params: { permitId: 1, viewMode: VIEW_MODE.EDIT },
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <PermitLeadTimesUpsert {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
    props.permitStore.setPermitDataModel(permit);
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
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
    parentComp.onInputChange({ colDef: { field: 'leadTimeValue' } } as any, '');
  });

  it('should add the new type on add button click', () => {
    wrapper
      .find(AgGridMasterDetails)
      .props()
      .onAddButtonClick();
  });

  it('should call upsertChangeRecords on SAVE action', () => {
    headerActions.find(PermitEditorActions).simulate('onUpsert', GRID_ACTIONS.SAVE);
    expect(props.permitStore.upsertPermit).to.be.ok;
  });

  it('should call upsert function on save button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(props.permitStore.upsertPermit).to.be.ok;
  });

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'leadTimeType' } } as any, null);
    parentComp.onDropDownChange({ colDef: { field: 'flightOperationalCategory' } } as any, { id: 1, name: 'Active' });
    parentComp.onDropDownChange({ colDef: { field: 'farType' } } as any, {
      id: 2,
      cappsCode: 'InActive',
      flightOperationalCategory: { id: 1, name: 'test' },
      purposeOfFlights: []
    });
    expect(mock.callCount).equal(3);
  });
});
