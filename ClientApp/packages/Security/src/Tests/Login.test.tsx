import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Login } from '../Components';

describe('Login Component', () => {
  let wrapper: ShallowWrapper;
  const onLoginClick = sinon.spy();

  beforeEach(() => {
    wrapper = shallow(<Login onLoginClick={onLoginClick} />).dive();
  });

  afterEach(() => wrapper.unmount())

  it('should render without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render Login button', () => {
    expect(wrapper.find(PrimaryButton).text()).to.equal('Login');
  });

  it('should call props on button click', () => {
    wrapper.find(PrimaryButton).simulate('click');
    expect(onLoginClick.calledOnce).to.be.true;
  });
});
