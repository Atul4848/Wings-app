import { GridApiMock, IGridApi } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import { EventTypeModel, EventTypeStoreMock, EVENTTYPE_FILTERS } from '../../Shared';
import { PureEventType } from '../EventType';
import * as sinon from 'sinon';
import { ModalKeeper, ModalStore } from '@uvgo-shared/modal-keeper';
import { ConfirmDialog } from '@wings-shared/layout';
import { SearchHeader } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('EventType', () => {
  let wrapper: ShallowWrapper;
  let modal: ShallowWrapper;
  let instance;
  const eventTypeStore = new EventTypeStoreMock();
  let gridApi: IGridApi;
  const eventTypeData = new EventTypeModel({
    id: 1,
    name: 'FIGHT_PLAN',
  });

  const searchHeader = (): ShallowWrapper => wrapper.find(SearchHeader);
  const customAgGridReact = (): ShallowWrapper => wrapper.find(CustomAgGridReact);

  beforeEach(() => {
    gridApi = new GridApiMock({ data: eventTypeData });
    wrapper = shallow(
      <div>
        <PureEventType eventTypeStore={eventTypeStore} />
        <ModalKeeper />
      </div>
    );
    modal = wrapper
      .find(ModalKeeper)
      .dive()
      .shallow();
    wrapper = wrapper
      .find(PureEventType)
      .dive()
      .shallow();
    instance = wrapper.instance();
    instance.data = eventTypeData;
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
    searchHeader().simulate('search', 'PLAN');
    expect(instance.searchValue).to.equal('PLAN');
    expect(instance.gridApi.onFilterChanged.calledOnce).to.be.true;
  });

  it('SearchHeader sets selectedOption and it calls gridApi', () => {
    instance.gridApi = gridApi;
    searchHeader().simulate('searchTypeChange', EVENTTYPE_FILTERS.NAME);
    expect(instance.selectedOption).to.equal(EVENTTYPE_FILTERS.NAME);
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
    instance.confirmRemoveEventType(1);
    modal.find(ConfirmDialog).simulate('noClick');
    expect(closeSpy.called).to.be.true;
  });

  it('should close dialog with confirm dialog yes Click', () => {
    instance.gridApi = gridApi;
    const removeEventType = sinon.spy(instance, 'removeEventType');
    instance.confirmRemoveEventType(1);
    modal.find(ConfirmDialog).simulate('yesClick');
    expect(removeEventType.called).to.be.true;
  });
});
