import React from 'react';
import { mount } from 'enzyme';
import {ErrorFallbackDefault} from '../Components';
import { expect } from 'chai';

describe('ErrorFallbackDefault Component', () => {
  let wrapper;
  const mockError = new Error('Test Error');

  beforeEach(() => {
    wrapper = mount(<ErrorFallbackDefault error={mockError} />);
  });

  it('renders without errors', () => {
    expect(wrapper.exists()).to.be.true;
  });

  it('displays the error message', () => {
    const errorInfo = wrapper.find('pre').at(0).text();
    expect(errorInfo).to.contain('Error Info: Test Error');
  });

});
