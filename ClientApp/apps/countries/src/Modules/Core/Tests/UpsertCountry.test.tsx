import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { CountryStoreMock } from '../../Shared';
import { UpsertCountry } from '../Components';
import { SidebarStore } from '@wings-shared/layout';

describe('UpsertCountry', () => {
  let wrapper: ShallowWrapper;

  const props = {
    countryStore: new CountryStoreMock(),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<UpsertCountry {...props} />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});
