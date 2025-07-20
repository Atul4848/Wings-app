import { AgGridTestingHelper, AirportModel } from '@wings/shared';
import { expect } from 'chai';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { AirportHoursStoreMock, AirportSettingsStoreMock } from '../../Shared';
import AirportHours from '../AirportHoursV2';
import { SidebarStore } from '@wings-shared/layout';
import { MemoryRouter } from 'react-router-dom';
import { CommonAirportHoursGrid } from '../Components';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Airport Hours V2', () => {
  let agGridHelper: AgGridTestingHelper;
  let wrapper: ReactWrapper;

  const props = {
    airportHoursStore: new AirportHoursStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = mount(
      <MemoryRouter>
        <AirportHours {...props} />
      </MemoryRouter>
    );
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should call reset filter function on reset button click', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onResetFilterClick();
  });

  it('should call chip input functions', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().chipInputProps.getChipLabel(new AirportModel());
    searchHeader.props().chipInputProps.getOptionLabel(new AirportModel());
  });

  it('should start audit and cancel actions', () => {
    wrapper
      .find(CommonAirportHoursGrid)
      .props()
      .onAction(GRID_ACTIONS.AUDIT, 1);
    wrapper
      .find(CommonAirportHoursGrid)
      .props()
      .onAction(GRID_ACTIONS.CANCEL, 1);
  });
});
