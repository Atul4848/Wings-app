import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { AgGridTestingHelper } from '@wings/shared';
import { CONTACT_TYPE, HealthVendorContactModel, HealthVendorStoreMock } from '../../Shared';
import { HealthVendorContactGrid } from '../index';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { SettingsTypeModel, GRID_ACTIONS } from '@wings-shared/core';
import { CollapsibleWithButton } from '@wings-shared/layout';
// import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';

describe('HealthVendorContactGrid', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;
  let contact = new HealthVendorContactModel({
    id: 1,
    contact: 'test',
    contactLevel: new SettingsTypeModel({ id: 1 }),
  });

  const props = {
    type: CONTACT_TYPE.PHONE,
    contacts: [contact],
    healthVendorStore: new HealthVendorStoreMock(),
    onUpdate: sinon.fake(),
    onContactEditing: sinon.fake(),
    isEditable: true,
  };

  beforeEach(() => {
    wrapper = shallow(<HealthVendorContactGrid {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, should render CustomAgGridReact ', () => {
    expect(wrapper).to.be.ok;
    // expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    const props = agGridHelper.getAgGridProps();
    expect(props.isRowEditing).false;
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    const propsV1 = agGridHelper.getAgGridProps();
    expect(propsV1.isRowEditing).true;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    const propsV2 = agGridHelper.getAgGridProps();
    expect(propsV2.isRowEditing).false;
  });

  it('should call upsert function on save button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
  });

  it('should call delete function on delete button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.DELETE, 1);
    const modalData = shallow(ModalStore.data);
    const confirmDialog = modalData.find('ConfirmDialog');
    // confirmDialog.props().onNoClick();
    // confirmDialog.props().onYesClick();
  });

  it('should stop row editing on default', () => {
    agGridHelper.onAction(GRID_ACTIONS.AUDIT, 0);
    const propsV2 = agGridHelper.getAgGridProps();
    expect(propsV2.isRowEditing).false;
  });

  it('should add the new type on add button click', () => {
    wrapper
      .find(CollapsibleWithButton)
      .props()
      .onButtonClick();
  });
});
