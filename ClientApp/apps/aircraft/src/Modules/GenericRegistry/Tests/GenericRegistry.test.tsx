import { GRID_ACTIONS } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';
import { Logger } from '@wings-shared/security';
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { GenericRegistryStoreMock, SettingsStoreMock } from '../../Shared';
import GenericRegistry from '../GenericRegistry';
import { SidebarStore } from '@wings-shared/layout';

describe('Generic registry Module', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;
  let genericRegistryStore = new GenericRegistryStoreMock();
  let settingsStore = new SettingsStoreMock();
 

  const props = {
    settingsStore,
    genericRegistryStore,
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    sinon.stub(Logger, 'warning');
    wrapper = mount(<GenericRegistry {...props} />);
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
    expect(agGridHelper.getAgGridProps().isRowEditing).true;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call upsert function on save button click', () => {
    const mock = sinon.spy(props.genericRegistryStore, 'upsertGenericRegistry');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });

  it('should call upsert function on refresh button click', () => {
    const mock = sinon.spy(props.genericRegistryStore, 'refreshGenericRegistry');
    agGridHelper.onAction(GRID_ACTIONS.REFRESH, 1);
    expect(mock.calledOnce).false;
  });
});

