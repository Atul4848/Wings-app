import React from 'react';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
import { HealthVendorStoreMock } from '../../Shared';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import HealthVendor from '../HealthVendor';
import { SidebarStore } from '@wings-shared/layout';
import { Provider } from 'mobx-react';
import { MemoryRouter } from 'react-router';

describe('HealthVendor', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    healthVendorStore: new HealthVendorStoreMock(),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = mount(
      <Provider {...props}>
        <MemoryRouter>
          <HealthVendor {...props} />
        </MemoryRouter>
      </Provider>
    );
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, render SearchHeader and CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(SearchHeaderV3)).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });

  it('should call reset filter function on reset button click', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onResetFilterClick();
  });

  it('should call filter change function', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged();
  });

  it('should call right content function', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().rightContent();
  });
});
