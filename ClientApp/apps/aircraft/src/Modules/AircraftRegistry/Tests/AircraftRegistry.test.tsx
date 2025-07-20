import * as React from 'react';
import { shallow } from 'enzyme';
import { AircraftRegistryStoreMock } from '../../Shared';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import AircraftRegistry from '../AircraftRegistry';
import { AgGridTestingHelper } from '@wings/shared';
import { SidebarStore } from '@wings-shared/layout';

describe('AircraftRegistry Module', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    aircraftRegistryStore: new AircraftRegistryStoreMock(),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<AircraftRegistry {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });
  
  it('should call filter change function when isInitEvent is false', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(false);
  });

  it('should call filter change function  when isInitEvent is true', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(true);
  });

  it('should render the react node with rightContent function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .rightContent();
  });
  
  it('should call filter change function on Search', () => {
      const searchHeader = wrapper.find(SearchHeaderV3);
      searchHeader.props().onSearch();
    });
});
