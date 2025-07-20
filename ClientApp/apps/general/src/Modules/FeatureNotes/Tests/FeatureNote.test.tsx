import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { GridApiMock, IGridApi } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import {
  FeatureNoteModel,
  FeatureNoteStoreMock,
  FEATURE_NOTE_FILTERS,
  CacheControlStore,
  CacheControlStoreMock,
} from '../../Shared';
import { PureFeatureNote } from '../FeatureNote';
import { expect } from 'chai';
import sinon from 'sinon';
import { ModalKeeper, ModalStore } from '@uvgo-shared/modal-keeper';
import { Provider } from 'mobx-react';
import { ConfirmDialog } from '@wings-shared/layout';
import { SearchHeader } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Feature Notes', () => {
  let wrapper: ShallowWrapper;
  let modal: ShallowWrapper;
  let instance;
  let gridApi: IGridApi;
  const featureNote = new FeatureNoteModel({
    id: '62273d6dfb6255e36a491cb0',
    startDate: '2022-03-17T15:59:00',
    title: 'Test Note',
    message: '# Heading1',
  });

  const props = {
    classes: {},
    featureNoteStore: new FeatureNoteStoreMock(),
  };

  const searchHeader = (): ShallowWrapper => wrapper.find(SearchHeader);
  const customAgGridReact = (): ShallowWrapper => wrapper.find(CustomAgGridReact);

  beforeEach(() => {
    gridApi = new GridApiMock({ data: featureNote });
    wrapper = shallow(
      <Provider cacheControlStore={new CacheControlStoreMock()}>
        <PureFeatureNote {...props} />
        <ModalKeeper />
      </Provider>
    );
    modal = wrapper
      .find(ModalKeeper)
      .dive()
      .shallow();
    wrapper = wrapper
      .find(PureFeatureNote)
      .dive()
      .shallow();
    instance = wrapper.instance();
    instance.data = featureNote;
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
    searchHeader().simulate('search', '2022-03-17');
    expect(instance.searchValue).to.equal('2022-03-17');
    expect(instance.gridApi.onFilterChanged.calledOnce).to.be.true;
  });

  it('SearchHeader sets selectedOption and it calls gridApi', () => {
    instance.gridApi = gridApi;
    searchHeader().simulate('searchTypeChange', FEATURE_NOTE_FILTERS.START_DATE);
    expect(instance.selectedOption).to.equal(FEATURE_NOTE_FILTERS.START_DATE);
    expect(instance.gridApi.onFilterChanged.calledOnce).to.be.false;
  });

  it('GRID Action DELETE should render ConfirmDialog', () => {
    instance.gridApi = gridApi;
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    expect(modalData.find(ConfirmDialog)).to.have.length(1);
  });

  it('GRID Action Publish should render ConfirmDialog', () => {
    instance.gridApi = gridApi;
    instance.gridActions(GRID_ACTIONS.PUBLISH, 1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    expect(modalData.find(ConfirmDialog)).to.have.length(1);
  });

  it('GRID Action Archive should render ConfirmDialog', () => {
    instance.gridApi = gridApi;
    instance.gridActions(GRID_ACTIONS.ARCHIVE, 1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    expect(modalData.find(ConfirmDialog)).to.have.length(1);
  });

  it('GRID Action UnArchive should render ConfirmDialog', () => {
    instance.gridApi = gridApi;
    instance.gridActions(GRID_ACTIONS.UNARCHIVE, 1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    expect(modalData.find(ConfirmDialog)).to.have.length(1);
  });

  it('should close dialog with confirm dialog no Click', () => {
    instance.gridApi = gridApi;
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    instance.confirmRemoveFeatureNote(1);
    modal.find(ConfirmDialog).simulate('noClick');
    expect(closeSpy.called).to.be.true;
  });

  it('should close dialog with confirm dialog yes Click', () => {
    instance.gridApi = gridApi;
    const removeFeatureNoteSpy = sinon.spy(instance, 'removeFeatureNote');
    instance.confirmRemoveFeatureNote(1);
    modal.find(ConfirmDialog).simulate('yesClick');
    expect(removeFeatureNoteSpy.called).to.be.true;
  });

  it('should close publish confirm dialog no Click', () => {
    instance.gridApi = gridApi;
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    instance.confirmPublishFeatureNote(1);
    modal.find(ConfirmDialog).simulate('noClick');
    expect(closeSpy.called).to.be.true;
  });

  it('should close publish confirm dialog yes Click', () => {
    instance.gridApi = gridApi;
    const updateFeatureNoteSpy = sinon.spy(instance, 'updateFeatureNote');
    instance.confirmPublishFeatureNote(1);
    modal.find(ConfirmDialog).simulate('yesClick');
    expect(updateFeatureNoteSpy.called).to.be.true;
  });

  it('should close archive confirm dialog no Click', () => {
    instance.gridApi = gridApi;
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    instance.confirmArchiveFeatureNote(1);
    modal.find(ConfirmDialog).simulate('noClick');
    expect(closeSpy.called).to.be.true;
  });

  it('should close archive confirm dialog yes Click', () => {
    instance.gridApi = gridApi;
    const updateFeatureNoteSpy = sinon.spy(instance, 'updateFeatureNote');
    instance.confirmArchiveFeatureNote(1);
    modal.find(ConfirmDialog).simulate('yesClick');
    expect(updateFeatureNoteSpy.called).to.be.true;
  });

  it('Grid action should return if row index is null', () => {
    const editCaller = sinon.spy();
    instance.gridActions(null, null);
    expect(editCaller.calledOnce).to.be.false;
  });
});
