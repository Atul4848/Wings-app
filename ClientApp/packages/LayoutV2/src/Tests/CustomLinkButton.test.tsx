import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { CustomLinkButton } from '../Components';
import { PrimaryButton } from '@uvgo-shared/buttons';

describe('CustomLinkButton', () => {
  const props = {
    to: 'TEST',
    classes: {},
    title: 'TEST',
    startIcon: <div>Hello</div>,
  };

  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(<CustomLinkButton {...props} />);
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render PrimaryButton', () => {
    const button = wrapper
      .dive()
      .dive()
      .find(PrimaryButton);
    expect(button).to.have.length(1);
  });
});
