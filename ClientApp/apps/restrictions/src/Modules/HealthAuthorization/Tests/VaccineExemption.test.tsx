import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import VaccineExemption from '../Components/VaccineExemption/VaccineExemption';

describe('Vaccine Exemption', () => {
  let wrapper: ShallowWrapper;

  const props = {
    entity: 'CREW',
    value: true,
  };

  beforeEach(() => {
    wrapper = shallow(<VaccineExemption {...props} />);
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});
