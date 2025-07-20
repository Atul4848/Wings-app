import { GridApiMock, IGridApi } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import { SearchSubscription } from '../Components';
import { UserSubscriptionModel, UserSubscriptionStoreMock } from '../../Shared';
import sinon from 'sinon';

describe('SearchSubscription', () => {
  let wrapper: ShallowWrapper;
  let instance;
  let gridApi: IGridApi;
  const onSearch = sinon.fake();

  const props = {
    classes: {},
    subscriptionStore: new UserSubscriptionStoreMock(),
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
    wrapper = shallow(<SearchSubscription {...props} />)
      .dive()
      .shallow();
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });
});
