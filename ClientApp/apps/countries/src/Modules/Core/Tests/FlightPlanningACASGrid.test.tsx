import { EntityMapModel, GRID_ACTIONS, SettingsTypeModel } from '@wings-shared/core';
import { AgGridTestingHelper, BasePermitStoreMock } from '@wings/shared';
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { OperationalRequirementStoreMock, SettingsStoreMock } from '../../Shared';
import { SidebarStore } from '@wings-shared/layout';
import { MemoryRouter } from 'react-router-dom';
import FlightPlanningACASGrid from '../Components/OperationalRequirements/FlightPlanning/FlightPlanningACASGrid';
import { AgGridMasterDetails, CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import moment from 'moment';

describe('FlightPlanningACASGrid', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;
  let agGridHook;
  let onDataSaveMock;
  let onRowEditingChangeMock;

  const props = {
    settingsStore: new SettingsStoreMock(),
    operationalRequirementStore: new OperationalRequirementStoreMock(),
    basePermitStore: new BasePermitStoreMock(),
    sidebarStore: SidebarStore,
    onDataSave: sinon.spy(),
    mockOnRowEditingChange: sinon.spy(),
    acasiiAdditionalInformations: [],
    acasiIdataIsRqrd: false,
    onRowEditingChange: sinon.spy(),
  };

  const reRender = () => wrapper.setProps({ abc: Math.random() });

  beforeEach(() => {
    agGridHook = sinon.stub();
    onDataSaveMock = sinon.stub();
    onRowEditingChangeMock = sinon.stub();
    wrapper = mount(
      <MemoryRouter>
        <FlightPlanningACASGrid {...props} />
      </MemoryRouter>
    );
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should add a new flight planning ACAS', () => {
    const addNewItemsStub = sinon.stub();
    agGridHook.returns({ addNewItems: addNewItemsStub });

    wrapper
      .find(AgGridMasterDetails)
      .props()
      .onAddButtonClick();

    expect(addNewItemsStub.calledOnce).to.be.false;
  });

  it('should be rendered without errors and render AgGridMasterDetails', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(AgGridMasterDetails)).to.have.length(1);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).to.be.false;
  });

  it('should start row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).to.be.true;
  });

  it('should stop row editing on save,delete and cancel', () => {
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).to.be.false;
    agGridHelper.onAction(GRID_ACTIONS.DELETE, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).to.be.false;
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).to.be.false;
  });

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'flightOperationalCategory' } } as any, null);
    parentComp.onDropDownChange({ colDef: { field: 'requirementType' } } as any, 'abc');
    expect(mock.callCount).equal(2);
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onInputChange');
    parentComp.onInputChange({ colDef: { field: 'mtowMin' } } as any, '');
    parentComp.onInputChange({ colDef: { field: 'paxMin' } } as any, '');
    parentComp.onInputChange({ colDef: { field: 'airworthinessDate' } } as any, '');
    expect(mock.callCount).equal(3);
  });

  it('should add 6 columns in the table', () => {
    expect(wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs).to.have.length(6);
  });

  it('should compare values correctly in column definitions', () => {
    const mockData1 = moment();
    const mockData2 = moment().add(1);

    agGridHelper.compareColumnValues(['airworthinessDate'], mockData1, mockData2);
  });

  it('should format values correctly in column definitions', () => {
    const mockData = {
      value: { name: 'Mock Name', label: 'Mock Label' },
    };
    const fieldsToCheck = ['flightOperationalCategory', 'requirementType', 'airworthinessDate'];
    agGridHelper.validateColumnFormatting(fieldsToCheck, mockData);
  });

  it('action menus correctly in column definitions', () => {
    agGridHelper.validateActionMenus(2);
  });

  it('should provide the correct autocomplete options for all fields', function() {
    const fieldToOptionsMap = {
      flightOperationalCategory: props.basePermitStore.flightOperationalCategories,
      requirementType: props.settingsStore.requirementType,
    };

    agGridHelper.validateAutocompleteOptions(fieldToOptionsMap);
  });
});
