import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { FlightPlanStoreMock } from '../../Shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { FlightPlanFormatChangeRecord } from '../Component';
import { AgGridTestingHelper } from '@wings/shared';
import { GRID_ACTIONS } from '@wings-shared/core';
import { SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { MemoryRouter } from 'react-router';

describe('FlightPlanFormatChangeRecord module', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    flightPlanStore: new FlightPlanStoreMock(),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = mount(
      <MemoryRouter>
        <FlightPlanFormatChangeRecord {...props} />
      </MemoryRouter>
    );
    agGridHelper = new AgGridTestingHelper(wrapper);
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

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    const props = agGridHelper.getAgGridProps();
    expect(props.isRowEditing).false;
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
