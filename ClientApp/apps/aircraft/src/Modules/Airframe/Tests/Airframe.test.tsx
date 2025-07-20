import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { expect } from 'chai';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { AirframeStoreMock } from '../../Shared';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { SidebarStore } from '@wings-shared/layout';
import Airframe from '../Airframe';
import { AgGridTestingHelper } from '@wings/shared';
import { MemoryRouter } from 'react-router';

describe('Airframe Module', () => {
  let wrapper: ReactWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    airframeStore: new AirframeStoreMock(),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = mount(
      <MemoryRouter>
        <Airframe {...props} />
      </MemoryRouter>
    );
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, should render CustomAgGridReact and SearchHeader', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
  });

  it('should add 8 columns in the table', () => {
    expect(wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs).to.have.length(8);
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
