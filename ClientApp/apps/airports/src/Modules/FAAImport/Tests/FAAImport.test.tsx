/* eslint-disable mocha/no-mocha-arrows */
import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { GridApiMock, IGridApi } from '@wings/shared';
import { AirportStoreMock, FAAImportProcess, FAA_IMPORT_STATUS_FILTER } from '../../Shared';
import FAAImport from '../../FAAImport/FAAImport';
import sinon from 'sinon';
import { SearchHeader } from '@wings-shared/form-controls';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { SidebarStore } from '@wings-shared/layout';

describe('FAA Import Module', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let gridApi: IGridApi;
  const data = [ new FAAImportProcess() ];

  const props = {
    airportStore: new AirportStoreMock(),
    sidebarStore: SidebarStore,
  };

  const columnApi = {
    autoSizeAllColumns: sinon.fake(),
  };

  beforeEach(() => {
    gridApi = new GridApiMock();
    wrapper = shallow(<FAAImport {...props} />).dive();
    instance = wrapper.instance();
    instance.gridApi = new GridApiMock({ data });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, should render CustomAgGridReact and SearchHeader', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
    expect(wrapper.find(SearchHeader)).to.be.ok;
  });

  it('SearchHeader sets searchValue and it calls gridApi', () => {
    wrapper.find(SearchHeader).simulate('search', 'TEST');
    expect(instance.searchValue).to.equal('TEST');
    expect(instance.gridApi.onFilterChanged.calledOnce).to.be.true;
  });

  it('SearchHeader sets selectedOption and it calls gridApi', () => {
    const setSelectedOptionSpy = sinon.spy(instance, 'setSelectedOption');
    wrapper.find(SearchHeader).simulate('searchTypeChange', FAA_IMPORT_STATUS_FILTER.STATUS);
    expect(setSelectedOptionSpy.calledOnce).to.be.true;
    expect(instance.gridApi.onFilterChanged.calledOnce).to.be.true;
  });

  it('SearchHeader calls expandCollapse', () => {
    instance.gridApi = gridApi;
    instance.columnApi = columnApi;
    const expandCollapse = sinon.spy(instance, 'autoSizeColumns');
    wrapper.find(SearchHeader).prop('expandCollapse')();
    expect(expandCollapse.called).to.be.true;
  });

  it('should call onChipAddOrRemove', () => {
    const onChipAddOrRemoveSpy = sinon.spy(instance, 'onChipAddOrRemove');
    wrapper.find(SearchHeader).simulate('chipAddOrRemove', ['Test']);
    expect(onChipAddOrRemoveSpy.calledOnce).to.be.true;
  });

  it('Grid action should return if row index is null', () => {
    const editCaller = sinon.spy();
    instance.gridActions(null, null);
    expect(editCaller.calledOnce).to.be.false;
  });
});
