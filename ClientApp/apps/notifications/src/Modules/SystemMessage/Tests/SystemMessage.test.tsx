import { GridApiMock, IGridApi } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import {
  SystemMessageModel,
  SystemMessageStoreMock,
  SystemMessageTypeModel,
  SYSTEM_MESSAGES_FILTERS,
} from '../../Shared';
import { PureSystemMessage } from '../SystemMessage';
import { PrimaryButton } from '@uvgo-shared/buttons';
import * as sinon from 'sinon';
import { ModalKeeper, ModalStore } from '@uvgo-shared/modal-keeper';
import { ConfirmDialog } from '@wings-shared/layout';
import { SearchHeader } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('System Message Module', () => {
  let wrapper: ShallowWrapper;
  let modal: ShallowWrapper;
  let instance;
  const systemMessageStore = new SystemMessageStoreMock();
  let gridApi: IGridApi;
  const systemMessageData = new SystemMessageModel({
    id: 1,
    type: new SystemMessageTypeModel({ id: 'VERIFICATION_COMPLETED', name: 'VERIFICATION_COMPLETED' }),
    value: 'Verification Completed',
  });

  const searchHeader = (): ShallowWrapper => wrapper.find(SearchHeader);
  const customAgGridReact = (): ShallowWrapper => wrapper.find(CustomAgGridReact);
  const primaryButton = (): ShallowWrapper =>
    searchHeader()
      .shallow()
      .dive()
      .find(PrimaryButton);

  beforeEach(() => {
    gridApi = new GridApiMock({ data: systemMessageData });
    wrapper = shallow(
      <div>
        <PureSystemMessage systemMessageStore={systemMessageStore} />
        <ModalKeeper />
      </div>
    );
    modal = wrapper
      .find(ModalKeeper)
      .dive()
      .shallow();
    wrapper = wrapper
      .find(PureSystemMessage)
      .dive()
      .shallow();
    instance = wrapper.instance();
    instance.data = systemMessageData;
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
    searchHeader().simulate('search', 'VERIFICATION_COMPLETED');
    expect(instance.searchValue).to.equal('VERIFICATION_COMPLETED');
    expect(instance.gridApi.onFilterChanged.calledOnce).to.be.true;
  });

  it('SearchHeader sets selectedOption and it calls gridApi', () => {
    instance.gridApi = gridApi;
    searchHeader().simulate('searchTypeChange', SYSTEM_MESSAGES_FILTERS.TYPE);
    expect(instance.selectedOption).to.equal(SYSTEM_MESSAGES_FILTERS.TYPE);
    expect(instance.gridApi.onFilterChanged.calledOnce).to.be.false;
  });

  it('onInputChange sets hasError', () => {
    gridApi = new GridApiMock({ hasError: true });
    instance.gridApi = gridApi;
    instance.onInputChange();
    expect(instance.hasError).to.be.true;
  });

  it('Add button should call Grid API and hasError to true', () => {
    // expect text should  match
    expect(primaryButton().text()).to.equal('Add System Message');
    instance.gridApi = gridApi;

    // should start editing cell if new row added
    const addSpy = sinon.spy(instance, 'addSystemMessage');
    primaryButton().simulate('click');
    expect(instance.hasError).to.true;
    expect(addSpy.calledOnce).to.be.true;
  });

  it('should Grid action perform cases and default on Stop Editing', () => {
    const model = new SystemMessageModel({ id: 0 });
    gridApi = new GridApiMock({ data: model });
    instance.gridApi = gridApi;

    // No editing if no rowIndex provided
    expect(instance.gridActions(null, null)).to.equal(undefined);
    expect(gridApi.stopEditing.calledOnce).to.equal(false);

    // EDIT case
    instance.gridActions(GRID_ACTIONS.EDIT, 1);
    expect(gridApi.startEditingCell.calledWith({ rowIndex: 1, colKey: 'type' })).to.be.true;
    expect(gridApi.ensureColumnVisible.calledOnce).to.be.true;

    // CANCEL case
    instance.gridActions(GRID_ACTIONS.CANCEL, 1);
    expect(gridApi.stopEditing.calledWith(true)).to.be.true;

    // DELETE case
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    expect(gridApi.applyTransaction.calledWith({ remove: [model] })).to.be.true;
    expect(gridApi.redrawRows.called).to.be.true;

    // default case
    instance.gridActions(null, 1);
    expect(gridApi.stopEditing.calledWith(true)).to.be.true;
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
    instance.confirmRemoveSystemMessage(1);
    modal.find(ConfirmDialog).simulate('noClick');
    expect(closeSpy.called).to.be.true;
  });

  it('should close dialog with confirm dialog yes Click', () => {
    instance.gridApi = gridApi;
    const removeSystemMessage = sinon.spy(instance, 'removeSystemMessage');
    instance.confirmRemoveSystemMessage(1);
    modal.find(ConfirmDialog).simulate('yesClick');
    expect(removeSystemMessage.called).to.be.true;
  });

  it('should check if System Message type already does not exists', () => {
    let cells = [
      {
        getFrameworkComponentInstance: () => ({ hasError: false }),
        getValue: () => systemMessageData,
      },
    ];
    instance.data = [
      new SystemMessageModel({
        id: 2,
        type: new SystemMessageTypeModel({ id: 'VERIFICATION_CODE', name: 'VERIFICATION_CODE' }),
      }),
    ];
    instance.gridApi = { ...new GridApiMock(), getCellEditorInstances: () => cells };
    instance.gridActions(GRID_ACTIONS.SAVE, 1);
    expect(instance.gridApi.setData.calledOnce).to.equal(true);
  });
});
