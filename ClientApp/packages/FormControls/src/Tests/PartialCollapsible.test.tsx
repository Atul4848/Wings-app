import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { PartialCollapsible } from '../Components';

describe('PartialCollapsible component', () => {
  let wrapper: ShallowWrapper;
  let instance: any;

  const props = {
    classes: {},
    className: 'TEST',
    title: 'test',
    isCollapsible: true,
    defaultCollapsed: true,
    renderView: <></>,
  };

  beforeEach(() => {
    wrapper = shallow(<PartialCollapsible {...props} />).dive();
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});
