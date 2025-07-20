import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import FaaMergedStatus from '../Components/FaaMergedStatus/FaaMergedStatus';

describe('FAA Merged Status', () => {
  let wrapper: any;

  const props = {
    fieldKey:'test'
  };

  beforeEach(() => {
    wrapper = mount(<FaaMergedStatus {...props} />);
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});