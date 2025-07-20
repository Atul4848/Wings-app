import { GridApiMock, IGridApi } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import { EventModel, EventStoreMock, EventTypeModel, EventTypeStoreMock, EVENT_FILTERS } from '../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import * as sinon from 'sinon';
import { PureEvent } from '../Event';
import { ModalKeeper, ModalStore } from '@uvgo-shared/modal-keeper';
import { ConfirmDialog } from '@wings-shared/layout';
import { SearchHeader } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Event', () => {
  let wrapper: ShallowWrapper;
  let modal: ShallowWrapper;
  let instance;
  let eventStore = new EventStoreMock();
  let gridApi: IGridApi;
  const eventData = new EventModel({
    id: 1,
    triggerTime: '2021-07-17T15:59:00',
    eventType: new EventTypeModel(),
  });

  const searchHeader = (): ShallowWrapper => wrapper.find(SearchHeader);
  const customAgGridReact = (): ShallowWrapper => wrapper.find(CustomAgGridReact);
  const primaryButton = (): ShallowWrapper =>
    searchHeader()
      .shallow()
      .dive()
      .find(PrimaryButton);

  beforeEach(() => {
    gridApi = new GridApiMock({ data: eventData });
    wrapper = shallow(
      <div>
        <PureEvent classes={{}} eventStore={eventStore} />
        <ModalKeeper />
      </div>
    );
    modal = wrapper
      .find(ModalKeeper)
      .dive()
      .shallow();
    wrapper = wrapper
      .find(PureEvent)
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
    searchHeader().simulate('search', '2021-07-17');
    expect(instance.searchValue).to.equal('2021-07-17');
    expect(instance.gridApi.onFilterChanged.calledOnce).to.be.true;
  });

  it('SearchHeader sets selectedOption and it calls gridApi', () => {
    instance.gridApi = gridApi;
    searchHeader().simulate('searchTypeChange', EVENT_FILTERS.TRIGGER_TIME);
    expect(instance.selectedOption).to.equal(EVENT_FILTERS.TRIGGER_TIME);
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
    instance.confirmRemoveEvent(1);
    modal.find(ConfirmDialog).simulate('noClick');
    expect(closeSpy.called).to.be.true;
  });

  it('should close dialog with confirm dialog yes Click', () => {
    instance.gridApi = gridApi;
    const removeChannel = sinon.spy(instance, 'removeEvent');
    instance.confirmRemoveEvent(1);
    modal.find(ConfirmDialog).simulate('yesClick');
    expect(removeChannel.called).to.be.true;
  });
});
