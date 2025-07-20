import React from 'react';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { CategoryStoreMock, ContactStoreMock, EventTypeStoreMock, UserSubscriptionStoreMock } from '../../Shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Dialog } from '@uvgo-shared/dialog';
import AddUserSubscription from '../Components/AddUserSubscription/AddUserSubscription';
import { VIEW_MODE } from '@wings/shared';
import { ViewInputControl } from '@wings-shared/form-controls';

describe('Add User Subscription', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: ShallowWrapper;

  const props = {
    addUserSubscription: sinon.fake(),
    subscriptionStore: new UserSubscriptionStoreMock(),
    eventTypeStore: new EventTypeStoreMock(),
    contactStore: new ContactStoreMock(),
    categoryStore: new CategoryStoreMock(),
    viewMode: VIEW_MODE.NEW,
  };

  beforeEach(() => {
    wrapper = shallow(<AddUserSubscription {...props} />).dive().dive();
    instance = wrapper.instance();
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('close button should close dialog', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    wrapper.find(Dialog).simulate('Close');
    expect(closeSpy.called).to.be.true;
  });

  it('onValueChange should be called on ViewInputControl change', () => {
    const mockValueChange = sinon.fake();
    instance.onValueChange = mockValueChange;
    dialogContent.find(ViewInputControl).at(0).simulate('ValueChange');
    expect(mockValueChange.called).to.be.true;
  });

  it('onValueChange should update form value', () => {
    const mockFormUpdate = sinon.fake();
    instance.getField('contact').set = mockFormUpdate;
    instance.onValueChange('test', 'contact');
    expect(mockFormUpdate.called).to.be.true;
  });
});
