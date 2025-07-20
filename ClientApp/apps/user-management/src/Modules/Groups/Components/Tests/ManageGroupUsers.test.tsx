import React from 'react';
import { shallow, ShallowWrapper } from "enzyme";
import { GridApiMock } from '@wings/shared';
import { GroupsUsersModel, ManageGroupUsersMock, UserStoreMock } from "../../../Shared";
import { PureManageGroupsUsers } from "../ManageGroupUsers/ManageGroupUsers";
import { PrimaryButton } from '@uvgo-shared/buttons';
import { expect } from "chai";
import sinon from "sinon";
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ConfirmDialog } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Manage Groups Users', () => {
  let wrapper: ShallowWrapper;
  let instance;

  const props = {
    classes: {},
    groupStore: new ManageGroupUsersMock(),
    userStore: new UserStoreMock(),
    params: { id: '0', name: 'test' }
  }

  beforeEach(() => {
    wrapper = shallow(<PureManageGroupsUsers {...props} />).dive();
    instance = wrapper.instance();
    instance.gridApi = new GridApiMock({ data: new GroupsUsersModel() });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('assign user button should open assigned users dialog', () => {
    const openAssignPeopleDialogSpy = sinon.spy(instance, 'openAssignPeopleDialog')
    wrapper.find(PrimaryButton).simulate('Click')
    expect(openAssignPeopleDialogSpy.called).to.be.true
  });

  it('Grid action should return if row index is null', () => {
    const editCaller = sinon.spy();
    instance.gridActions(null, null);
    expect(editCaller.calledOnce).to.be.false;
  });

  it('GRID Action DELETE should render ConfirmDialog', () => {
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    expect(modalData.find(ConfirmDialog)).to.have.length(1);

    // on Yes click in dialog should delete Groups
    const deleteUserFromGroupSpy = sinon.spy(instance, 'deleteUserFromGroup')
    modalData.find(ConfirmDialog).simulate('YesClick')
    expect(deleteUserFromGroupSpy.called).to.be.true;

    // on No click should close dialog
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    modalData.find(ConfirmDialog).simulate('NoClick')
    expect(closeSpy.called).to.be.true;
  });
});
