import React from 'react';
import { expect } from 'chai';
import { ShallowWrapper, shallow } from 'enzyme';
import { Chip } from '@material-ui/core';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';
import PopoverWrapper from '../Components/AirportHoursDetails/AirportHoursGrid/Components/ConditionEditor/PopoverWrapper/PopoverWrapper';
import sinon from 'sinon';

describe('PopoverWrapper', () => {
  let wrapper: ShallowWrapper;

  const props = {
    children: <>Test</>,
    chipsValues: [{ label: 'TEST', value: 1 }],
    tooltip: 'Tooltip',
    hasError: false,
    disabled: false,
    isRowEditing: true,
    onOkClick: sinon.spy(),
    onClose: sinon.spy(),
    onCancelClick: sinon.spy(),
    onPopoverOpen: sinon.spy(),
  };

  const event = { stopPropagation: sinon.spy() };

  beforeEach(() => {
    wrapper = shallow(<PopoverWrapper {...props} />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render buttons and Chip', () => {
    wrapper.setProps({ isRowEditing: true });
    expect(wrapper.find(SecondaryButton)).to.have.length(1);
    expect(wrapper.find(PrimaryButton)).to.have.length(1);
    expect(wrapper.find(Chip)).to.have.length(1);
  });

  it('should call onPopoverOpen on chip click', () => {
    wrapper.find(Chip).simulate('click');
    expect(props.onPopoverOpen.calledOnce).to.be.true;
  });

  it('should call onCancelClick on Cancel button click', () => {
    wrapper
      .find(SecondaryButton)
      .props()
      .onClick(event);
    expect(props.onCancelClick.calledOnce).to.be.true;
  });

  it('should call onOkClick on Save button click', () => {
    wrapper
      .find(PrimaryButton)
      .props()
      .onClick(event);
    expect(props.onOkClick.calledOnce).to.be.true;
  });
});
