import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { GlobalStyles } from '../Components';

describe('GlobalStyles Component', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(<GlobalStyles />).dive();
  });

  afterEach(() => wrapper.unmount());

  it('should rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
});
