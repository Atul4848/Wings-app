import { AgGridTestingHelper } from '@wings/shared';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { TimeZoneReviewStoreMock } from '../../Shared';
import AirportTimeZoneReview from '../AirportTimeZoneReview';
import { GRID_ACTIONS, SettingsTypeModel } from '@wings-shared/core';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';

describe('Airport Time Zone Review', () => {
  let agGridHelper: AgGridTestingHelper;
  let wrapper;

  const props = {
    timeZoneReviewStore: new TimeZoneReviewStoreMock(),
    sidebarStore: SidebarStore,
  };

  const reRender = () => wrapper.setProps({ abc: Math.random() });

  beforeEach(() => {
    wrapper = shallow(<AirportTimeZoneReview {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should call filter change function when isInitEvent is false', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(false);
  });

  it('should call filter change function  when isInitEvent is true', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(true);
  });

  it('should call search change function  when isInitEvent is true', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onSearch('');
  });

  it('should add 11 columns in the table', () => {
    expect(wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs).to.have.length(11);
  });

  it('should format values correctly in column definitions', () => {
    const mockData = {
      value: { name: 'Mock Name', label: 'Mock Label' },
    };
    const fieldsToCheck = ['timeZoneRegion', 'generalDetails.sourceType'];
    agGridHelper.validateColumnFormatting(fieldsToCheck, mockData);
  });

  it('should compare values correctly in column definitions', () => {
    const mockStatus1 = new SettingsTypeModel({ id: 1, name: 'Active' });
    const mockStatus2 = new SettingsTypeModel({ id: 2, name: 'InActive' });
    agGridHelper.compareColumnValues(['timeZoneRegion'], mockStatus1, mockStatus2);
  });

  it('should provide the correct autocomplete options for all fields', function() {
    const fieldToOptionsMap = {
      timeZoneRegion: props.timeZoneReviewStore.timeZoneRegions,
    };

    agGridHelper.validateAutocompleteOptions(fieldToOptionsMap);
  });

  it('should render the react node with rightContent function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .rightContent();
  });

  it('should call action function', () => {
    const columnDefs = agGridHelper.getGridOptions().columnDefs as any;
    columnDefs.forEach(col => {
      if (col.cellRenderer === 'actionRenderer') {
        col.cellRendererParams?.onAction(GRID_ACTIONS.EDIT, null);
        col.cellRendererParams?.onAction(GRID_ACTIONS.EDIT, 1);
        col.cellRendererParams?.onAction(GRID_ACTIONS.DELETE, 1);
      }
    });
  });
});
