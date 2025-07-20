import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { SidebarStore } from '@wings-shared/layout';
import { UpsertAirframe } from '../Components';

describe('UpsertAirframe', () => {
  let wrapper: ShallowWrapper;

  const props = {
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<UpsertAirframe {...props} />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});
