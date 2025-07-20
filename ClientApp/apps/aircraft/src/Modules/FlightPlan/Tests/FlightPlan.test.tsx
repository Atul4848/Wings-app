import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { FlightPlanStoreMock } from '../../Shared';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { SidebarStore } from '@wings-shared/layout';
import FlightPlan from '../FlightPlan';
import { AgGridTestingHelper } from '@wings/shared';
import { MemoryRouter } from 'react-router';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('FlightPlan Module', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    flightPlanStore: new FlightPlanStoreMock(),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper =  mount(<MemoryRouter><FlightPlan {...props} /></MemoryRouter>);
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(SearchHeaderV3)).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call reset filter function on reset button click', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onResetFilterClick();
  });

  it('should call filter change function when isInitEvent is false', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(false);
  });

  it('should call filter change function  when isInitEvent is true', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(true);
  });
});
