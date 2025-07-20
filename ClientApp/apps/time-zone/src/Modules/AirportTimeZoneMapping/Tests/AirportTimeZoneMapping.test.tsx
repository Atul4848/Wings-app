import { GRID_ACTIONS } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { SidebarStore } from '@wings-shared/layout';
import { MemoryRouter } from 'react-router-dom';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import AirportTimeZoneMapping from '../AirportTimeZoneMapping';
import {
  AirportTimeZoneMappingStoreMock,
  TimeZoneDetailStoreMock,
  TimeZoneSettingsStoreMock,
  TimeZoneStoreMock,
} from '../../Shared';

describe('Airport Time Zone Mapping', () => {
  let wrapper: any;
  let agGridHook;
  let addNewItemsStub;
  let agGridHelper: AgGridTestingHelper;
  let upsertAirportTimeZoneMappingMock;
  let removeAirportTimeZoneMappingMock;

  const props = {
    timeZoneStore: new TimeZoneStoreMock(),
    timeZoneDetailStore: new TimeZoneDetailStoreMock(),
    timeZoneSettingsStore: new TimeZoneSettingsStoreMock(),
    airportTimeZoneMappingStore: new AirportTimeZoneMappingStoreMock(),
    sidebarStore: SidebarStore,
  };

  const reRender = () => wrapper.setProps({ abc: Math.random() });

  beforeEach(() => {
    agGridHook = sinon.stub();
    addNewItemsStub = sinon.stub();
    wrapper = mount(
      <MemoryRouter>
        <AirportTimeZoneMapping {...props} />
      </MemoryRouter>
    );
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
    upsertAirportTimeZoneMappingMock = sinon.spy(props.airportTimeZoneMappingStore, 'upsertAirportTimeZoneMapping');
    removeAirportTimeZoneMappingMock = sinon.spy(props.airportTimeZoneMappingStore, 'removeAirportTimeZoneMapping');
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

  it('should call filter change function when isInitEvent is false', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(false);
  });

  it('should call filter change function  when isInitEvent is true', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(true);
  });

  it('should call upsert function on delete button click', () => {
    const { onAction } = agGridHelper.getCellEditorParams();
    onAction(GRID_ACTIONS.DELETE, 1);
    expect(removeAirportTimeZoneMappingMock.calledOnce).to.be.false;
  });

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'airportCode' } } as any, null);
    parentComp.onDropDownChange({ colDef: { field: 'airportLocation' } } as any, 'abc');
    expect(mock.callCount).equal(2);
  });

  it('should call search change function  when isInitEvent is true', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onSearch("");
  });
});
