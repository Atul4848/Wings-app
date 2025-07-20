/* eslint-disable mocha/no-setup-in-describe */
/* eslint-disable mocha/no-hooks-for-single-case */
import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import SyncSettings from '../SyncSettings';

describe('Sync Settings Module', function () {
  let wrapper: ShallowWrapper;
  let instance;

  const props = {
    classes: {},
    onTabChange: sinon.spy(),
  };

  beforeEach(function () {
    wrapper = shallow(<SyncSettings {...props} />).dive();
    instance = wrapper.instance();
  });

  afterEach(function () {
    wrapper.unmount();
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.be.ok;
  });

});
