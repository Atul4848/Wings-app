import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AircraftVariationModel } from '../../Shared';
import { SelectVariationView } from '../Components';

describe('SelectVariationView Module', () => {
  let wrapper: ShallowWrapper;

  const props = {
    aircraftVariation: new AircraftVariationModel(),
  };

  beforeEach(() => {
    wrapper = shallow(<SelectVariationView {...props} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});
