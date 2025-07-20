import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { CacheControlStoreMock } from '../../../../Shared';
import Reset from '../Reset';

describe('Cache Reset Component', function () {
  let wrapper: ShallowWrapper;
  let instance: any;
  beforeEach(function () {
    wrapper = shallow(<Reset cacheControlStore={new CacheControlStoreMock()} />)
      .dive()
      .dive();
    instance = wrapper.instance();
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.be.ok;
  });
});
