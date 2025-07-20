import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import AirportHours from '../AirportHours';
import { AirportHoursStoreMock, AirportSettingsStoreMock, AIRPORT_HOUR_FILTERS, AirportHoursModel } from '../../Shared';
import { GridApiMock, IGridApi, AuditHistory } from '@wings/shared';
import { ModalKeeper, ModalStore } from '@uvgo-shared/modal-keeper';
import { CommonAirportHoursGrid } from '../Components';
import { SearchHeader } from '@wings-shared/form-controls';
import { AccessLevelModel, GRID_ACTIONS } from '@wings-shared/core';
import { ScheduleModel } from '@wings-shared/scheduler';
import { SidebarStore } from '@wings-shared/layout';

describe('Airport Hours Component', () => {
  let wrapper: ShallowWrapper;
  let modal: ShallowWrapper;
  let instance: any;
  let gridApi: IGridApi;
  const columnApi = {
    autoSizeAllColumns: sinon.fake(),
  };

  const airportData = new AirportHoursModel({
    id: 1,
    accessLevel: new AccessLevelModel({ id: 1, name: 'private' }),
    statusId: 1,
    sourceTypeId: 1,
    schedule: new ScheduleModel({ id: 1 }),
  });

  const props = {
    airportHoursStore: new AirportHoursStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    sidebarStore: SidebarStore,
    classes: {},
  };

  beforeEach(() => {
    gridApi = new GridApiMock({ data: airportData });
    wrapper = shallow(
      <div>
        <AirportHours {...props} />
        <ModalKeeper />
      </div>
    );
    modal = wrapper
      .find(ModalKeeper)
      .dive()
      .shallow();
    wrapper = wrapper
      .find(AirportHours)
      .shallow()
      .dive()
      .shallow();
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
    ModalStore.data = null;
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CommonAirportHoursGrid)).to.have.length(1);
  });

  it('SearchHeader sets selectedOption and it calls gridApi', () => {
    instance.gridApi = gridApi;
    wrapper.find(SearchHeader).simulate('searchTypeChange', AIRPORT_HOUR_FILTERS.AIRPORT_HOURS_TYPE);
    expect(instance.selectedOption).to.equal(AIRPORT_HOUR_FILTERS.AIRPORT_HOURS_TYPE);
    expect(gridApi.onFilterChanged.calledOnce).to.be.false;
  });

  it('SearchHeader sets searchValue and it calls gridApi', () => {
    instance.gridApi = gridApi;
    const onSearchSpy = sinon.spy(instance, 'onSearch');
    wrapper.find(SearchHeader).simulate('search', 'Test');
    expect(onSearchSpy.called).to.be.true;

    // expandCollapse
    instance.columnApi = columnApi;
    const expandCollapse = sinon.spy(instance, 'autoSizeColumns');
    wrapper.find(SearchHeader).prop('expandCollapse')();
    expect(expandCollapse.called).to.be.true;
  });

  it('should call onPaginationChange', () => {
    const loadAirportHoursSpy = sinon.spy(instance, 'loadAirportHours');
    wrapper.find(CommonAirportHoursGrid).simulate('paginationChange');
    expect(loadAirportHoursSpy.called).to.be.true;
  });

  it('SearchHeader sets chipAddOrRemove', () => {
    instance.gridApi = null;
    wrapper.find(SearchHeader).simulate('chipAddOrRemove', ['Test']);
    expect(props.airportHoursStore.searchChips).lengthOf(1);
  });

  it('SearchHeader calls onResetFilterClick', () => {
    instance.gridApi = gridApi;
    const onFilterResetClickHandlerSpy = sinon.spy(instance, 'onFilterResetClickHandler');
    wrapper.find(SearchHeader).simulate('resetFilterClick');
    expect(onFilterResetClickHandlerSpy.called).to.be.true;
  });

  it('should remove tfoAirports when clear all chips', () => {
    instance.gridApi = new GridApiMock({
      editingCells: [
        {
          rowIndex: 0,
          rowPinned: '',
          column: null,
        },
      ],
    });

    // when there is no searchChips
    wrapper.find(SearchHeader).simulate('chipAddOrRemove', []);
    expect(instance.airportHoursStore.tfoAirports).lengthOf(0);

    // else case
    wrapper.find(SearchHeader).simulate('chipAddOrRemove', ['Test']);
    expect(instance.gridApi.onFilterChanged.called).to.be.true;
  });

  it('should call onAction', () => {
    const gridActionsSpy = sinon.spy(instance, 'gridActions');
    wrapper.find(CommonAirportHoursGrid).simulate('action');
    expect(gridActionsSpy.called).to.be.true;
  });

  it('should open AuditHistory on Grid action AUDIT', () => {
    gridApi = new GridApiMock({ data: airportData });
    instance.gridApi = gridApi;

    instance.gridActions(GRID_ACTIONS.AUDIT, 1);
    const auditHistory = shallow(ModalStore.data);
    expect(auditHistory).to.have.length(1);

    // else case
    instance.gridActions(GRID_ACTIONS.EDIT, null);
    expect(wrapper.find(AuditHistory)).to.have.length(0);
  });
});
