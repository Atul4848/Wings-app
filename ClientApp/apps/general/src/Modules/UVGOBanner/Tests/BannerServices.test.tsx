import { GridApiMock, IGridApi } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import { UVGOBannerServicesModel, UVGOBannerStoreMock } from '../../Shared';
import BannerServices from '../Components/BannerServices/BannerServices';
import { PrimaryButton } from '@uvgo-shared/buttons';
import * as sinon from 'sinon';
import { ModalKeeper, ModalStore } from '@uvgo-shared/modal-keeper';
import { ConfirmDialog } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Banner Services', () => {
  let wrapper: ShallowWrapper;
  let modal: ShallowWrapper;
  let instance;
  const uvgoBannerStore = new UVGOBannerStoreMock();
  let gridApi: IGridApi;
  const uvgoBannerServices = new UVGOBannerServicesModel({
    name: 'abc',
  });

  const customAgGridReact = (): ShallowWrapper => wrapper.find(CustomAgGridReact);
  const primaryButton = (): ShallowWrapper => wrapper.find(PrimaryButton);

  beforeEach(() => {
    gridApi = new GridApiMock({ data: uvgoBannerServices });
    wrapper = shallow(
      <div>
        <BannerServices uvgoBannerStore={uvgoBannerStore} />
        <ModalKeeper />
      </div>
    );
    modal = wrapper.find(ModalKeeper).dive().shallow();
    wrapper = wrapper.find(BannerServices).dive().dive().shallow();
    instance = wrapper.instance();
    instance.data = uvgoBannerServices;
  });

  afterEach(() => {
    wrapper.unmount();
    ModalStore.data = null;
  });

  it('should be rendered without errors and CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(customAgGridReact()).to.be.ok;
  });

  it('onInputChange sets hasError', () => {
    gridApi = new GridApiMock({ hasError: true });
    instance.gridApi = gridApi;
    instance.onInputChange();
    expect(instance.hasError).to.be.true;
  });

  it('Add button should call Grid API and hasError to true', () => {
    // expect text should  match
    expect(primaryButton().text()).to.equal('Add Banner Services');
    instance.gridApi = gridApi;

    // should start editing cell if new row added
    const addSpy = sinon.spy(instance, 'addBannerServices');
    primaryButton().simulate('click');
    expect(instance.hasError).to.true;
    expect(addSpy.calledOnce).to.be.true;
  });

  it('should check if Banner Services already exists', () => {
    instance.data = [uvgoBannerServices];

    //should check for duplicate Banner Services name
    instance.gridApi = {
      ...new GridApiMock(),
      getCellEditorInstances: () => [{ getValue: () => 'abc' }],
    };
    instance.gridActions(GRID_ACTIONS.SAVE, 1);
    expect(instance.gridApi.setData.calledOnce).to.equal(false);
  });

  it('should Grid action perform cases and default on Stop Editing', () => {
    const model = new UVGOBannerServicesModel({ id: 0 });
    gridApi = new GridApiMock({ data: model });
    instance.gridApi = gridApi;

    // No editing if no rowIndex provided
    expect(instance.gridActions(null, null)).to.equal(undefined);
    expect(gridApi.stopEditing.calledOnce).to.equal(false);

    // EDIT case
    instance.gridActions(GRID_ACTIONS.EDIT, 1);
    expect(gridApi.startEditingCell.calledWith({ rowIndex: 1, colKey: 'name' })).to.be.true;
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
    instance.confirmRemoveBannerServices(1);
    modal.find(ConfirmDialog).simulate('noClick');
    expect(closeSpy.called).to.be.true;
  });

  it('should close dialog with confirm dialog yes Click', () => {
    instance.gridApi = gridApi;
    const removeBannerServices = sinon.spy(instance, 'removeBannerServices');
    instance.confirmRemoveBannerServices(1);
    modal.find(ConfirmDialog).simulate('yesClick');
    expect(removeBannerServices.called).to.be.true;
  });
});
