import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { UpsertCustomer } from '../index';
import { CustomerStoreMock } from '../../Shared';
import { SidebarStore } from '@wings-shared/layout';

describe('UpsertCustomer', () => {
  let wrapper: ShallowWrapper;

  const props = {
    customerStore: new CustomerStoreMock(''),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<UpsertCustomer basePath={''} {...props} />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});
