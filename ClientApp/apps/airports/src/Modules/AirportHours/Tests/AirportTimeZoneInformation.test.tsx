import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { AirportTimeZoneInformation } from '../Components';
import { AirportStoreMock } from '../../Shared';

describe('Airport TimeZone Information V2 Component', () => {
  let wrapper: any;

  const props = {
    icaoOrUwaCode: 'TEST',
    airportStore: new AirportStoreMock(),
  };

  beforeEach(() => {
    wrapper = mount(<AirportTimeZoneInformation {...props} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});