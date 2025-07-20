import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { NotFoundPage } from '../Components';

describe('Page Not Found Component', () => {
  it('should render without errors', () => {
    const wrapper: ShallowWrapper = shallow(<NotFoundPage />);
    expect(wrapper).to.have.length(1);
  });
});
