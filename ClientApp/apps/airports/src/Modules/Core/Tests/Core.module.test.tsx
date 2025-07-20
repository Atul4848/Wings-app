import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import CoreModule from '../Core.module';
import { AirportStoreMock } from '../../Shared/Mocks';
import { AuditHistory, GridApiMock, IGridApi } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import sinon from 'sinon';
import { AIRPORT_FILTERS } from '../../Shared/Enums';
import { AirportLocationModel, AirportModel, ICAOCodeModel } from '../../Shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { SearchHeader } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import { SidebarStore } from '@wings-shared/layout';

describe('Airports Module', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let gridApi: IGridApi;
  const airportData = new AirportModel({
    id: 1,
    name: 'Chandigarh',
    icaoCode: new ICAOCodeModel({ id: 1, code: 'KHOU' }),
    airportLocation: new AirportLocationModel({ id: 5 }),
  });

  const props = {
    airportStore: new AirportStoreMock(),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    gridApi = new GridApiMock();
    wrapper = shallow(<CoreModule {...props} />)
      .dive()
      .dive();
    instance = wrapper.instance();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render CustomAgGridReact', () => {
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
  });

  it('SearchHeader sets searchValue when onSearch is called', () => {
    instance.gridApi = gridApi;
    wrapper.find(SearchHeader).simulate('search', 'Test');
    expect(instance.searchValue).to.equal('Test');
  });

  it('SearchHeader sets selectedOption when onSearchTypeChange is called', () => {
    instance.gridApi = gridApi;
    wrapper.find(SearchHeader).simulate('searchTypeChange', AIRPORT_FILTERS.NAME);
    expect(instance.selectedOption).to.equal(AIRPORT_FILTERS.NAME);
  });

  it('CustomAgGridReact should loadAirports onPaginationChange', () => {
    const loadAirportsSpy = sinon.spy(instance, 'loadAirports');
    wrapper.find(CustomAgGridReact).simulate('paginationChange');
    expect(loadAirportsSpy.called).to.be.true;
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

  it('SearchHeader calls onResetFilterClick', () => {
    instance.gridApi = gridApi;
    const onFilterResetClickHandlerSpy = sinon.spy(instance, 'onFilterResetClickHandler');
    wrapper.find(SearchHeader).simulate('resetFilterClick');
    expect(onFilterResetClickHandlerSpy.called).to.be.true;
  });
});
