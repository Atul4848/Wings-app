import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import { PureUserSubscriptionTabs } from '../UserSubscriptionTabs';

describe('UserSubscriptionTabs', () => {
  let wrapper: ShallowWrapper;
  let instance;

  const props = {
    classes: {},
    params: { searchContact: '' },
  };

  beforeEach(() => {
    wrapper = shallow(<PureUserSubscriptionTabs {...props} />)
      .dive()
      .shallow();
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});
