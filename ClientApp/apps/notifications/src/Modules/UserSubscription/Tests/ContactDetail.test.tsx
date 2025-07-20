import React from 'react';
import { shallow, ShallowWrapper } from "enzyme";
import { GridApiMock } from '@wings/shared';
import { ChannelStoreMock, ContactModel, ContactStoreMock, UserSubscriptionStoreMock } from "../../Shared";
import { ContactDetail } from "../Components";
import { PrimaryButton } from '@uvgo-shared/buttons';
import { expect } from "chai";
import sinon from "sinon";
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ConfirmDialog } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('ContactDetail', () => {
  let wrapper: ShallowWrapper;
  let instance;

  const props = {
    classes: {},
    contactStore: new ContactStoreMock(),
    subscriptionStore: new UserSubscriptionStoreMock(),
    channelStore: new ChannelStoreMock(),
    fullName: '',
    userSubScriptionRoute: '',
  }

  const contact = new ContactModel({
    id: 1,
    name: 'email',
    value: 'test@gmail.com',
  });

  beforeEach(() => {
    props.subscriptionStore.setDefaultValue();
    wrapper = shallow(<ContactDetail {...props} />).dive();
    instance = wrapper.instance();
    instance.gridApi = new GridApiMock({ data: contact });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('add button should open upsert dialog', () => {
    const openUpsertContactDialogSpy = sinon.spy(instance, 'openUpsertContactDialog')
    wrapper.find(PrimaryButton).simulate('Click')
    expect(openUpsertContactDialogSpy.called).to.be.true
  });

  it('Grid action should return if row index is null', () => {
    const editCaller = sinon.spy();
    instance.gridActions(null, null);
    expect(editCaller.calledOnce).to.be.false;
  });

  it('Grid action EDIT should open upsert dialog', () => {
    const loadUserSubscriptionsSpy = sinon.spy(instance, 'openUpsertContactDialog')
    instance.gridActions(GRID_ACTIONS.EDIT, 1);
    expect(loadUserSubscriptionsSpy.called).to.be.true;
  });

  it('GRID Action DELETE should render ConfirmDialog', () => {
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    expect(modalData.find(ConfirmDialog)).to.have.length(1);

    // on Yes click in dialog should delete contact
    const deleteContactSpy = sinon.spy(instance, 'deleteContact')
    modalData.find(ConfirmDialog).simulate('YesClick')
    expect(deleteContactSpy.called).to.be.true;

    // on No click should close dialog
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    modalData.find(ConfirmDialog).simulate('NoClick')
    expect(closeSpy.called).to.be.true;
  });
});