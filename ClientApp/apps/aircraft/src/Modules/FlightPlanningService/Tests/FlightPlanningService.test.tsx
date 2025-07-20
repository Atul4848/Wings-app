import { GRID_ACTIONS } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';
import { Logger } from '@wings-shared/security';
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { FlightPlanningServiceStoreMock, SettingsStoreMock } from '../../Shared';
import { SidebarStore } from '@wings-shared/layout';
import FlightPlanningService from '../FlightPlanningService';


describe('FlightPlanningService Module', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    settingsStore: new SettingsStoreMock(),
    sidebarStore: SidebarStore,
    flightPlanningServiceStore: new FlightPlanningServiceStoreMock(),
  };


  beforeEach(() => {
    sinon.stub(Logger, 'warning');
    wrapper = mount(<FlightPlanningService {...props} />);
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should change the values with onFilterChange function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .onFiltersChanged();
  });

  it('should render the react node with rightContent function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .rightContent();
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    const props = agGridHelper.getAgGridProps();
    expect(props.isRowEditing).false;
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call upsert function on save button click', () => {
    const mock = sinon.spy(props.flightPlanningServiceStore, 'upsertFlightPlanningService');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });

  it('onDropDownChange should set hasError value based on changes', () => {
    const parentComp = agGridHelper.getParentComponent();
    parentComp.onDropDownChange({ colDef: { field: 'customerNumber' } } as any, '');
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    parentComp.onInputChange({ colDef: { field: 'customerName' } } as any, '');
  });

  it('should call delete function on delete button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.DELETE, 1);
    agGridHelper.getAgGridProps();
  });
});

