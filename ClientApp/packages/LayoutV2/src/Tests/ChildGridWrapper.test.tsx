import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { ChildGridWrapper } from '../Components';


describe('ChildGridWrapper module', () => {
  let wrapper: ShallowWrapper;
  let instance: any;

  const props = {
    classes: {},
    onAdd: sinon.fake(),
    hasAddPermission: true,
    disabled: true,
  };

  beforeEach(function () {
    wrapper = shallow(<ChildGridWrapper {...props} />).dive();
    instance = wrapper.instance();
  });

  afterEach(function () {
    wrapper.unmount();
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.have.length(1);
  });
});
