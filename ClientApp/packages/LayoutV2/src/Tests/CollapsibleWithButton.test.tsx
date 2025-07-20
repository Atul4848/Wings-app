import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Collapsable, CollapsibleWithButton } from '../Components';

describe('Collapsible With Button Component', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  const props = {
    buttonText: 'Test',
    children: <div>TEST</div>,
    title: 'Collapsible',
    classes: {},
    onButtonClick: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<CollapsibleWithButton {...props} />).dive();
    instance = wrapper.instance();
  });

  afterEach(() => wrapper.unmount());

  it('should rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should call collapsible on change handler', () => {
    const onChangeSpy = sinon.spy(instance, 'onChange');
    wrapper.find(Collapsable).simulate('change', {}, false);
    expect(onChangeSpy.calledOnce).to.be.true;
  });

  it('should call button click handler', () => {
    instance.isExpanded = false;
    const onBtnClickHandlerSpy = sinon.spy(instance, 'onBtnClickHandler');
    wrapper.find(PrimaryButton).simulate('click');
    expect(onBtnClickHandlerSpy.calledOnce).to.be.true;
  });
});
