import * as React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import sinon from 'sinon';
import { VariationSearch } from '../Components';
import { AircraftVariationStoreMock } from '../../Shared';
import { SearchHeaderV3 } from '@wings-shared/form-controls';

describe('VariationSearch Module', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    aircraftVariationStore:new AircraftVariationStoreMock(),
    onSelect: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<VariationSearch {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, should render CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
  });

  it('should call filter change function when isInitEvent is false', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(false);
  });

  it('should call filter change function  when isInitEvent is true', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(true);
  });

  it('should call filter change function on Search', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onSearch();
  });

  it('should call reset filter function on reset button click', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onResetFilterClick();
  });
});
