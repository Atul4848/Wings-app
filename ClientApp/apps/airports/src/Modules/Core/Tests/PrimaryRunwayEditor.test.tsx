import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AirportStoreMock } from '../../Shared';
import PrimaryRunwayEditor from '../Components/AirportRunway/AirportRunwayDetails/PrimaryRunwayEditor';

describe('Primary Runway Editor', () => {
  let wrapper: ShallowWrapper;

  const props = {
    airportStore:new AirportStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<PrimaryRunwayEditor {...props} />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});