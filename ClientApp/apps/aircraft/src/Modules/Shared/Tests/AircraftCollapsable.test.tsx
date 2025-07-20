import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AircraftCollapsable } from '../Components';

describe('AircraftCollapsable component', () => {
  let wrapper: ShallowWrapper;
  let instance: any;

  const props = {
    classes: {},
    children: <></>,
    title: 'test',
    isWithButton: true,
  };

  beforeEach(() => {
    wrapper = shallow(<AircraftCollapsable {...props} />).dive();
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});
