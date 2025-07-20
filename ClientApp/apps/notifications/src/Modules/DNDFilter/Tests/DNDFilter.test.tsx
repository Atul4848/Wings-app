import { GridApiMock, IGridApi } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import { DNDFilterModel, DNDFilterStoreMock, EventTypeModel, DND_FILTERS, MessageLevelModel } from '../../Shared';
import * as sinon from 'sinon';
import { PureDNDFilter } from '../DNDFilter';
import { ModalKeeper, ModalStore } from '@uvgo-shared/modal-keeper';
import { ConfirmDialog } from '@wings-shared/layout';
import { SearchHeader } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('DNDFilter', () => {
  let wrapper: ShallowWrapper;
  let modal: ShallowWrapper;
  let instance;
  let dndFilterStore = new DNDFilterStoreMock();
  let gridApi: IGridApi;
  const eventData = new DNDFilterModel({
    id: 1,
    startTime: '08:00',
    stopTime: '21:00',
    level: new MessageLevelModel(),
    eventType: new EventTypeModel(),
  });

  const searchHeader = (): ShallowWrapper => wrapper.find(SearchHeader);
  const customAgGridReact = (): ShallowWrapper => wrapper.find(CustomAgGridReact);

  beforeEach(() => {
    gridApi = new GridApiMock({ data: eventData });
    wrapper = shallow(
      <div>
        <PureDNDFilter dndFilterStore={dndFilterStore} />
        <ModalKeeper />
      </div>
    );
    modal = wrapper
      .find(ModalKeeper)
      .dive()
      .shallow();
    wrapper = wrapper
      .find(PureDNDFilter)
      .dive()
      .shallow();
    instance = wrapper.instance();
    instance.data = eventData;
  });

  afterEach(() => {
    wrapper.unmount();
    ModalStore.data = null;
  });

  it('should be rendered without errors, render SearchHeader and CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(searchHeader()).to.be.ok;
    expect(customAgGridReact()).to.be.ok;
  });

  it('SearchHeader sets searchValue and it calls gridApi', () => {
    instance.gridApi = gridApi;
    searchHeader().simulate('search', '23:07');
    expect(instance.searchValue).to.equal('23:07');
    expect(instance.gridApi.onFilterChanged.calledOnce).to.be.true;
  });

  it('SearchHeader sets selectedOption and it calls gridApi', () => {
    instance.gridApi = gridApi;
    searchHeader().simulate('searchTypeChange', DND_FILTERS.START_TIME);
    expect(instance.selectedOption).to.equal(DND_FILTERS.START_TIME);
    expect(instance.gridApi.onFilterChanged.calledOnce).to.be.false;
  });

  it('GRID Action DELETE should render ConfirmDialog', () => {
    instance.gridApi = gridApi;
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    expect(modalData.find(ConfirmDialog)).to.have.length(1);
  });

  it('should close dialog with confirm dialog no Click', () => {
    instance.gridApi = gridApi;
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    instance.confirmRemoveDNDFilter(1);
    modal.find(ConfirmDialog).simulate('noClick');
    expect(closeSpy.called).to.be.true;
  });

  it('should close dialog with confirm dialog yes Click', () => {
    instance.gridApi = gridApi;
    const removeDNDFilter = sinon.spy(instance, 'removeDNDFilter');
    instance.confirmRemoveDNDFilter(1);
    modal.find(ConfirmDialog).simulate('yesClick');
    expect(removeDNDFilter.called).to.be.true;
  });
});
