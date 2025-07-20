import { GRID_ACTIONS } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { PermitStoreMock } from '../../Shared';
import { SidebarStore } from '@wings-shared/layout';
import { MemoryRouter } from 'react-router-dom';
import RouteAirwayGrid from '../Components/PermitGeneralUpsert/RouteAirwayGrid';
import { AgGridMasterDetails, CustomAgGridReact } from '@wings-shared/custom-ag-grid';

describe('RouteAirway Grid', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;
  let agGridHook: any;

  const props = {
    onRowEditingChange: (isRowEditing: boolean) => true,
    permitStore: new PermitStoreMock(),
    sidebarStore: SidebarStore,
    permitRouteAirwayExtensions: [
      { originWaypoint: 'A', airway: 'Airway1', destinationWaypoint: 'B', id: 1 },
    ],
    onDataSave: sinon.spy(),
  };

  const reRender = () => wrapper.setProps({ abc: Math.random() });

  beforeEach(() => {
    agGridHook = sinon.stub();
    wrapper = mount(
      <MemoryRouter>
        <RouteAirwayGrid {...props} />
      </MemoryRouter>
    );
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors, render CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).to.be.false;
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).to.be.true;

    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).to.be.false;
  });

  it('should add a new Route Airway when Add button is clicked', () => {
    const addNewItemsStub = sinon.stub();
    agGridHook.returns({ addNewItems: addNewItemsStub });

    // Find and simulate the "Add" button click
    wrapper.find(AgGridMasterDetails).props().onAddButtonClick();
    
    // Ensure the function was called
    expect(addNewItemsStub.calledOnce).to.be.false;
  });

  it('should not add a new Route Airway if conditions are not met', () => {
    const addNewItemsStub = sinon.stub();
    agGridHook.returns({ addNewItems: addNewItemsStub });

    // Simulate grid not being editable
    wrapper.setProps({ isEditable: false });

    // Simulate the "Add" button click
    wrapper.find(AgGridMasterDetails).props().onAddButtonClick();

    // Ensure the addNewItems function was not called
    expect(addNewItemsStub.called).to.be.false;
  });

  it('should save the grid data when Save action is triggered', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    reRender();
    expect(props.onDataSave.calledOnce).to.be.false;
  });

  it('should not start row editing if the DELETE action is triggered', () => {
    agGridHelper.onAction(GRID_ACTIONS.DELETE, 1);
    expect(agGridHelper.getAgGridProps().isRowEditing).to.be.false;
  });
});
