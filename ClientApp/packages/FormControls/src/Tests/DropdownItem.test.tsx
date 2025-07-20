import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import * as sinon from 'sinon';
import { DropdownItem } from '../Components';
import { expect } from 'chai';
describe('DropdownItem Component', function() {
  let wrapper: ReactWrapper;
  const props = {
    onClick: sinon.fake(),
    classes: { item: '', red: 'red-class', subtitle: 'subtitle' },
    isRed: true,
    isSubtitle: true,
  };

  beforeEach(function() {
    wrapper = mount(
      <DropdownItem {...props}>
        <span>Child node</span>
      </DropdownItem>
    );
  });

  afterEach(function() { return wrapper.unmount(); });

  it('should rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should render with no subtitle', function() {
    wrapper.setProps({ isSubtitle: false });
    const hasSubtitle = wrapper.first().hasClass(props.classes.subtitle);
    expect(hasSubtitle).to.be.false;
  });

  it('should clicked', function() {
    wrapper.setProps({ isSubtitle: false });
    wrapper.find('.red-class').first().simulate('click');
    expect(props.onClick.calledOnce).to.be.true;
  });
});
