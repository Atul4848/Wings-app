import { GRID_ACTIONS } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { CustomerStoreMock, SettingsStoreMock } from '../../Shared';
import { SidebarStore } from '@wings-shared/layout';
import Customer from '../Customer';
import { MemoryRouter } from 'react-router-dom';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { Logger } from '@wings-shared/security';

describe('Customer', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    customerStore: new CustomerStoreMock(''),
    settingsStore: new SettingsStoreMock(),
    sidebarStore: SidebarStore,
  };

  const reRender = () => wrapper.setProps({ abc: Math.random() });

  beforeEach(() => {
    sinon.stub(Logger, 'warning');
    wrapper = mount(
      <MemoryRouter>
        <Customer {...props} />
      </MemoryRouter>
    );
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).true;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call upsert function on save button click', () => {
    const mock = sinon.spy(props.customerStore, 'upsertCustomer');
    const { onAction } = agGridHelper.getCellEditorParams();
    onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
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
