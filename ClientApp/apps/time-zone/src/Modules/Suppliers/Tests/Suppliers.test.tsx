import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import Suppliers from '../Suppliers';
import { shallow, ShallowWrapper } from 'enzyme';
import { TimeZoneStoreMock } from '../../Shared';
import { AgGridTestingHelper } from '@wings/shared';
import { SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';

describe('Suppliers Module', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    timeZoneStore: new TimeZoneStoreMock(),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<Suppliers {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.lengthOf(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.lengthOf(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.lengthOf(1);
  });

  it('onSearch, onFiltersChanged and onPaginationChange should load suppliers', () => {
    const getSuppliersSpy = sinon.spy(props.timeZoneStore, 'getSuppliers');
    wrapper
      .find(SearchHeaderV3)
      .props()
      .onSearch();
    wrapper
      .find(SearchHeaderV3)
      .props()
      .onFiltersChanged();
    wrapper
      .find(CustomAgGridReact)
      .props()
      .onPaginationChange();
    expect(getSuppliersSpy.callCount).to.eq(3);
  });
});
