import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AssociatedFIRs } from '../Components';
import { SidebarStore } from '@wings-shared/layout';

describe('Associated FIR Module', () => {
  let wrapper: ShallowWrapper;
  let instance;

  const props = {
    title: 'Test',
    countryId: 1,
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<AssociatedFIRs {...props} />).dive();
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
});
