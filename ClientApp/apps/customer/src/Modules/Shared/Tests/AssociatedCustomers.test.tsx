import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AssociatedCustomers } from '../../Shared';

describe('AssociatedCustomers', () => {
  let wrapper: ShallowWrapper;

  const props = {
    title: 'Customer',
    backNavTitle: '',
    backNavLink: '/customer',
  };

  beforeEach(() => {
    wrapper = shallow(<AssociatedCustomers {...props} />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});
