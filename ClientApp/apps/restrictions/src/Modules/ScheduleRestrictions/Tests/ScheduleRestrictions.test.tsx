import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
// import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';

import { ScheduleRestrictionsStoreMock } from '../../Shared';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { SidebarStore } from '@wings-shared/layout';
import { AgGridTestingHelper } from '@wings/shared';
import ScheduleRestrictions from '../ScheduleRestrictions';

describe('ScheduleRestriction Module', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  let scheduleRestrictionsStore = new ScheduleRestrictionsStoreMock();
  let sidebarStore = SidebarStore;

  const props = {
    scheduleRestrictionsStore,
    sidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<ScheduleRestrictions {...props} />).dive();
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
});
