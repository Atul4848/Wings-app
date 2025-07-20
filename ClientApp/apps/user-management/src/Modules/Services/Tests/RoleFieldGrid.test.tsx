import React from 'react';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { RolesModel } from '../../Shared';
import { GridApiMock, IGridApi } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PureRoleFieldGrid } from '../Components/RoleFieldGrid/RoleFieldGrid';
import { ConfirmDialog } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Role Field Grid', () => {
  let wrapper: ShallowWrapper;
  let instance: any;

  const props = {
    classes: {},
    rolesField: [new RolesModel()],
    openRoleFieldDialog: sinon.fake(),
    upsertRoleField: sinon.fake(),
    deleteRoleField: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureRoleFieldGrid {...props} />);
    instance = wrapper.instance();
    instance.gridApi = {
      ...new GridApiMock({ data: [new RolesModel()] }),
    };
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });

  it('Grid action CANCEL should stopEditingCell', () => {
    instance.gridActions(GRID_ACTIONS.CANCEL, 1);
    expect(instance.gridApi.stopEditing.called).to.be.true;
  });

  it('Default Grid action is Stop Editing', () => {
    instance.gridActions(null, 1);
    expect(instance.gridApi.stopEditing.calledWith(true)).to.be.true;
  });

  it('Stop editing if no row index provided', () => {
    instance.gridActions(null, null);
    expect(instance.gridApi.stopEditing.calledOnce).to.be.false;
  });

  it('GRID Action Edit should called callback', () => {
    const confirmEditRoleFieldSpy = sinon.spy(instance, 'confirmEditRoleField');
    instance.gridActions(GRID_ACTIONS.EDIT, 1);
    expect(confirmEditRoleFieldSpy.called).to.be.true;
  });

  it('GRID Action DELETE should called callback', () => {
    const confirmRemoveRoleFieldSpy = sinon.spy(instance, 'confirmRemoveRoleField');
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    expect(confirmRemoveRoleFieldSpy.called).to.be.true;
  });

  it('should ask for confirmation on edit button', () => {
    instance.gridActions(GRID_ACTIONS.EDIT, 1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    modalData.find(ConfirmDialog).simulate('yesClick');
    expect(props.openRoleFieldDialog.called).to.be.true;
  });

  it('should ask for confirmation on delete button', () => {
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    modalData.find(ConfirmDialog).simulate('yesClick');
    expect(props.deleteRoleField.called).to.be.true;
  });

  it('should close edit dialog with confirm dialog NO Click', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    instance.confirmEditRoleField(1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    modalData.find(ConfirmDialog).simulate('noClick');
    expect(closeSpy.called).to.be.true;
    
  });

  it('should close delete dialog with confirm dialog NO Click', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    instance.confirmRemoveRoleField(1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    modalData.find(ConfirmDialog).simulate('noClick');
    expect(closeSpy.called).to.be.true;
  });
});
