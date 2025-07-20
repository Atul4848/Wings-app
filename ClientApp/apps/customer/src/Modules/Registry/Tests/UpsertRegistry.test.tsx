import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { UpsertRegistry } from '../Components';
import { RegistryStoreMock } from '../../Shared';
import { SidebarStore } from '@wings-shared/layout';

describe('UpsertRegistry', () => {
  let wrapper: ShallowWrapper;

  const props = {
    registryStore: new RegistryStoreMock(''),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<UpsertRegistry basePath={''} {...props} />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});
