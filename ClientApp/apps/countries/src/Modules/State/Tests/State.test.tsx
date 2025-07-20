import * as React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { CountryStoreMock, SettingsStoreMock } from '../../Shared/Mocks';
import { AgGridTestingHelper } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import * as sinon from 'sinon';
import { SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import State from '../State';

describe('State Module', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;
  const reRender = () => wrapper.setProps({ abc: Math.random() });
  const props = {
    settingsStore: new SettingsStoreMock(),
    countryStore: new CountryStoreMock(),
    sidebarStore: SidebarStore,
  };
  beforeEach(() => {
    wrapper = mount(<State {...props} />);
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should render the react node with rightContent function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .rightContent();
  });

  it('should change the values with onFilterChange function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .onFiltersChanged();
  });

  it('should change the values with onResetFilterClick function', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onResetFilterClick();
  });

  it('should start row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
  });

  it('should display details and audit history', () => {
    agGridHelper.onAction(GRID_ACTIONS.DETAILS, 1);
    agGridHelper.onAction(GRID_ACTIONS.AUDIT, 0);
  });

  it('should properly handle row editing state', () => {
    const isRowEditing = wrapper.find(CustomAgGridReact).prop('isRowEditing');
    expect(isRowEditing).to.be.false;
  });
});
