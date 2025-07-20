import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
// import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { AircraftOperatorRestrictionsStoreMock, SettingsStoreMock } from '../../Shared/Mocks';
import { AircraftOperatorRestriction } from '../index';
import { AircraftOperatorRestrictionsModel } from '../../Shared';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { SidebarStore } from '@wings-shared/layout';
import { AgGridTestingHelper } from '@wings/shared';
import { GRID_ACTIONS } from '@wings-shared/core';
import { ModalStore } from '@uvgo-shared/modal-keeper';

describe('AircraftOperatorRestriction Module', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;
  let aircraftOperatorRestrictionsStore = new AircraftOperatorRestrictionsStoreMock();
  let settingsStore = new SettingsStoreMock();
  let sidebarStore = SidebarStore;

  const props = {
    aircraftOperatorRestrictionsStore,
    settingsStore,
    sidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<AircraftOperatorRestriction {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(SearchHeaderV3)).to.be.ok;
    // expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });

  it('should call filter change function when isInitEvent is false', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(false);
  });

  it('should call filter change function  when isInitEvent is true', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(true);
  });

  it('should render the react node with null on rightContent function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .rightContent();
  });

  it('should call reset filter function on reset button click', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onResetFilterClick();
  });

  it('should show AuditHistory', () => {
    agGridHelper.onAction(GRID_ACTIONS.AUDIT, 1);
    const auditHistory = shallow(ModalStore.data);
    expect(auditHistory).to.have.length(1);
  });
});
