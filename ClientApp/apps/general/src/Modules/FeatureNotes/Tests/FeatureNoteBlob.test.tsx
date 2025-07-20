import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { GridApiMock, IGridApi } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { BlobModel, FeatureNoteStoreMock } from '../../Shared';
import { expect } from 'chai';
import sinon from 'sinon';
import { ModalKeeper, ModalStore } from '@uvgo-shared/modal-keeper';
import { FeatureNoteBlob } from '../Components';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ConfirmDialog } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Feature Note Blob', () => {
  let wrapper: ShallowWrapper;
  let instance;
  const blob = new BlobModel({
    name: 'image.png',
    url: 'https://uvgodev.blob.core.windows.net/newfeatures/62455306bd644de4bd91a421/603f339c-4665-4f37-b380-8bfc5192abf7.png',
  });

  const props = {
    classes: {},
    featureNoteId: '603f339c-4665-4f37-b380-8bfc5192abf7',
    onDataUpdate: sinon.fake(),
    featureNoteStore: new FeatureNoteStoreMock(),
    rowData: [blob],
  };

  beforeEach(() => {
    wrapper = shallow(<FeatureNoteBlob {...props} />)
      .dive()
      .dive();
    instance = wrapper.instance();
    instance.gridApi = {
      ...new GridApiMock({ data: [blob] }),
      getDisplayedRowAtIndex: sinon.fake.returns({ data: blob, setData: sinon.fake() }),
    };
  });

  afterEach(() => {
    wrapper.unmount();
    ModalStore.data = null;
  });

  it('should be rendered without errors, render CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });

  it('Grid action should return if row index is null', () => {
    const editCaller = sinon.spy();
    instance.gridActions(null, null);
    expect(editCaller.calledOnce).to.be.false;
  });

  it('GRID Action DELETE should render ConfirmDialog', () => {
    const removeBlobSpy = sinon.spy(instance, 'removeBlob');
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    expect(modalData.find(ConfirmDialog)).to.have.length(1);
    modalData.find(ConfirmDialog).simulate('yesClick');
    expect(removeBlobSpy.called).to.be.true;
  });
});
