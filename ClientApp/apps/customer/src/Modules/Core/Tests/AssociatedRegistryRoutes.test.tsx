import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AssociatedRegistryRoutes, CustomerStoreMock, RegistryStoreMock } from '../../Shared';
import { SidebarStore } from '@wings-shared/layout';
import sinon from 'sinon';

describe('AssociatedRegistryRoutes', () => {
  let wrapper: ShallowWrapper;

  const props = {
    sidebarStore: SidebarStore,
    customerStore: new CustomerStoreMock(),
    registryStore: new RegistryStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<AssociatedRegistryRoutes {...props} basePath="" />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});
