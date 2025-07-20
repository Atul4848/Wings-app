/* eslint-disable mocha/no-setup-in-describe */
/* eslint-disable mocha/no-hooks-for-single-case */
import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AirportMappingsModel, AirportMappingsStoreMock, AIRPORT_MAPPING_FILTERS } from '../../Shared';
import { GridApiMock, IGridApi, VIEW_MODE } from '@wings/shared';
import AirportMapping from '../AirportMapping';
import sinon from 'sinon';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ConfirmDialog } from '@wings-shared/layout';
import { SearchHeader } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';

describe('Airport Mapping Module', function() {
  let wrapper: ShallowWrapper;
  let instance: any;
  let gridApi: IGridApi;
  const mapping = new AirportMappingsModel();
  const columnApi = {
    autoSizeAllColumns: sinon.fake(),
  };
  const props = {
    airportMappingsStore: new AirportMappingsStoreMock(),
  };

  beforeEach(function() {
    gridApi = new GridApiMock();
    wrapper = shallow(<AirportMapping {...props} />)
      .dive()
      .dive();
    instance = wrapper.instance();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should render CustomAgGridReact', function() {
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
  });

  it('SearchHeader sets searchValue when onSearch is called', function() {
    instance.gridApi = gridApi;
    wrapper.find(SearchHeader).simulate('search', 'Test');
    expect(instance.searchValue).to.equal('Test');
  });

  it('SearchHeader sets selectedOption when onSearchTypeChange is called', function() {
    instance.gridApi = gridApi;
    wrapper.find(SearchHeader).simulate('searchTypeChange', AIRPORT_MAPPING_FILTERS.ICAO);
    expect(instance.selectedOption).to.equal(AIRPORT_MAPPING_FILTERS.ICAO);
  });

  it('CustomAgGridReact should loadAirportMapping onPaginationChange', function() {
    const loadAirportMappingSpy = sinon.spy(instance, 'loadAirportMapping');
    wrapper.find(CustomAgGridReact).simulate('paginationChange');
    expect(loadAirportMappingSpy.called).to.be.true;
  });

  it('SearchHeader calls onResetFilterClick', function() {
    instance.gridApi = gridApi;
    const onFilterResetClickHandlerSpy = sinon.spy(instance, 'onFilterResetClickHandler');
    wrapper.find(SearchHeader).simulate('resetFilterClick');
    expect(onFilterResetClickHandlerSpy.called).to.be.true;
  });

  it('Grid action should return if row index is null', function() {
    const editCaller = sinon.spy();
    instance.gridActions(null, null);
    expect(editCaller.calledOnce).to.be.false;
  });

  it('Grid action EDIT should open upsert dialog', function() {
    const openDialogSpy = sinon.spy(instance, 'openUpsertDialog');
    instance.gridActions(GRID_ACTIONS.EDIT, 1);
    expect(openDialogSpy.called).to.be.true;
  });
  it('GRID Action DELETE should render ConfirmDialog', function() {
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    const modalData = shallow(ModalStore.data);
    expect(modalData.find('ConfirmDialog')).to.have.length(1);

    // on Yes click in dialog should delete Asset
    const deleteAssetSpy = sinon.spy(instance, 'deleteMapping');
    modalData.find('ConfirmDialog').simulate('YesClick');
    expect(deleteAssetSpy.called).to.be.true;

    // on No click should close dialog
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    modalData.find('ConfirmDialog').simulate('NoClick');
    expect(closeSpy.called).to.be.true;
  });

  it('SearchHeader calls expandCollapse', function() {
    instance.gridApi = gridApi;
    instance.columnApi = columnApi;
    const expandCollapse = sinon.spy(instance, 'autoSizeColumns');
    wrapper.find(SearchHeader).prop('expandCollapse')();
    expect(expandCollapse.called).to.be.true;
  });
});
