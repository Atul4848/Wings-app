import React from 'react';
import { shallow, ShallowWrapper } from "enzyme";
import { GridApiMock } from '@wings/shared';
import { UserGroupModel, GroupStoreMock } from "../../../Shared";
import Groups from "../../Groups";
import { PrimaryButton } from '@uvgo-shared/buttons';
import { expect } from "chai";
import sinon from "sinon";
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ConfirmDialog } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Groups', () => {
  let wrapper: ShallowWrapper;
  let instance;

  const props = {
    classes: {},
    groupStore: new GroupStoreMock(),
  }

  beforeEach(() => {
    wrapper = shallow(<Groups {...props} />).dive().dive();
    instance = wrapper.instance();
    instance.gridApi = new GridApiMock({ data: new UserGroupModel() });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('add button should open upsert dialog', () => {
    const openGroupDialogSpy = sinon.spy(instance, 'openGroupDialog')
    wrapper.find(PrimaryButton).simulate('Click')
    expect(openGroupDialogSpy.called).to.be.true
  });

  it('Grid action should return if row index is null', () => {
    const editCaller = sinon.spy();
    instance.gridActions(null, null);
    expect(editCaller.calledOnce).to.be.false;
  });

  it('Grid action EDIT should open upsert dialog', () => {
    const openGroupDialogSpy = sinon.spy(instance, 'openGroupDialog')
    instance.gridActions(GRID_ACTIONS.EDIT, 1);
    expect(openGroupDialogSpy.called).to.be.true;
  });

  it('GRID Action DELETE should render ConfirmDialog', () => {
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    expect(modalData.find(ConfirmDialog)).to.have.length(1);

    // on Yes click in dialog should delete Groups
    const deleteGroupSpy = sinon.spy(instance, 'deleteGroup')
    modalData.find(ConfirmDialog).simulate('YesClick')
    expect(deleteGroupSpy.called).to.be.true;

    // on No click should close dialog
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    modalData.find(ConfirmDialog).simulate('NoClick')
    expect(closeSpy.called).to.be.true;
  });
});