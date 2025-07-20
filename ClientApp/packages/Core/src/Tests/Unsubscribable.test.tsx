import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { UnsubscribableComponent } from '../Components';

describe('Unsubscribable test', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(<UnsubscribableComponent />);
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should call componentWillUnmount when unmount component', () => {
    const componentWillUnmount = sinon.spy(wrapper.instance(), 'componentWillUnmount');
    wrapper.unmount();
    expect(componentWillUnmount.called).to.be.true
  });
});
