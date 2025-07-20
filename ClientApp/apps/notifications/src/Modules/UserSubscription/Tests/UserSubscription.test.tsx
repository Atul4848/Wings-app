import { GridApiMock, IGridApi } from '@wings/shared';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import { UserSubscription } from '../Components';
import { CategoryStoreMock, ContactStoreMock, EventTypeStoreMock, UserSubscriptionModel, UserSubscriptionStoreMock } from '../../Shared';
import sinon from 'sinon';
import { AutoCompleteControl } from '@wings-shared/form-controls';

describe('UserSubscription', () => {
  let wrapper: ShallowWrapper;
  let instance;
  let gridApi: IGridApi;

  const props = {
    classes: {},
    subscriptionStore: new UserSubscriptionStoreMock(),
    contactStore: new ContactStoreMock(),
    eventTypeStore: new EventTypeStoreMock(),
    categoryStore: new CategoryStoreMock(),
  };

  const userSubscriptionData = new UserSubscriptionModel({
    id: 1,
    name: 'Test Subscription',
    eventTypeId: 1,
    eventTypeName: 'TEST_NOTIFICATION',
    contactName: 'Email',
    contactValue: 'test@gmail.com',
  });

  beforeEach(() => {
    props.subscriptionStore.setDefaultValue();
    gridApi = new GridApiMock({ data: userSubscriptionData });
    wrapper = shallow(<UserSubscription {...props} />)
      .dive()
      .shallow();
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(AutoCompleteControl)).to.be.ok;
  });

  it('AutoCompleteControl should call loadUserSubscriptions on dropdown change', () => {
    const loadUserSubscriptionsSpy = sinon.spy(instance, 'loadUserSubscriptions');
    wrapper.find(AutoCompleteControl).simulate('DropDownChange');
    expect(loadUserSubscriptionsSpy.called).to.be.true;
  });

  it('AutoCompleteControl should call loadUsers on search value change', () => {
    const loadUsersSpy = sinon.spy(instance, 'loadUsers');
    wrapper.find(AutoCompleteControl).simulate('Search', 'test');
    expect(loadUsersSpy.called).to.be.true;
  });
});
