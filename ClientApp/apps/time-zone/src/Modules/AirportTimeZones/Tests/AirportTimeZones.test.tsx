import { GRID_ACTIONS } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { MemoryRouter } from 'react-router-dom';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { TimeZoneDetailStoreMock, TimeZoneSettingsStoreMock, TimeZoneStoreMock } from '../../Shared';
import AirportTimeZones from '../AirportTimeZones';

describe('Airport TimeZones Module', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;
  const sidebarStoreMock = { setNavLinks: sinon.fake() };

  const props = {
    timeZoneDetailStore: new TimeZoneDetailStoreMock(),
    timeZoneSettingsStore: new TimeZoneSettingsStoreMock(),
    timeZoneStore: new TimeZoneStoreMock(),
    sidebarStore: sidebarStoreMock,
  };

  const reRender = () => wrapper.setProps({ abc: Math.random() });

  beforeEach(() => {
    wrapper = mount(
      <MemoryRouter>
        <AirportTimeZones {...props} />
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
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
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
