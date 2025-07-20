import React from 'react';
import { shallow } from 'enzyme';
import { ViewPermission } from '../Components';
import { expect } from 'chai';

describe('ViewPermission component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <ViewPermission hasPermission={true}>
        <div>Content</div>
      </ViewPermission>
    );
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('does not render children when hasPermission is false', () => {
    wrapper.setProps({ hasPermission: false });
    expect(wrapper.exists('div')).to.be.false;
  });

  it('renders children when hasPermission is true', () => {
    expect(wrapper.exists('div')).to.be.true;
  });
});
