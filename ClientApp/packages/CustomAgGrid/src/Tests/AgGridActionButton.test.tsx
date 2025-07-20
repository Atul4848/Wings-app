import React from 'react';
import { ShallowWrapper, shallow } from 'enzyme';
import { expect } from 'chai';
import { AgGridActionButton } from '../Components';
import { IconButton, Tooltip } from '@material-ui/core';
import sinon from 'sinon';

describe('AgGridActionButton Component', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;

  const props = {
    to: () => 'abc',
    edit: false,
    info: true,
    onClick: sinon.fake(),
    onAction: sinon.fake(),
    isHidden: () => false,
    isActive: () => false,
    node: null,
    isEditOrDelete: false,
  };

  beforeEach(() => {
    wrapper = shallow(<AgGridActionButton {...props} />);
    wrapperInstance = wrapper.instance();
  });

  afterEach(() => wrapper.unmount());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should show TrashIcon', () => {
    wrapper.find(IconButton).simulate('click');
    expect(props.onClick.calledOnce).to.be.true;
  });

  it('should not show any Icons', () => {
    wrapper.setProps({ ...props, isHidden: () => true, info: false });
    expect(wrapper.find(IconButton).length).to.eq(0);
  });
  it('should render ToolTip when isEditOrDelete is true', () => {
    wrapper.setProps({ ...props, isEditOrDelete: true });
    expect(wrapper.find(Tooltip).length).to.eq(2);
  });

  it('should render ToolTip with correct titles when isEditOrDelete is true', () => {
    wrapper.setProps({ ...props, isEditOrDelete: true });
    expect(
      wrapper
        .find(Tooltip)
        .at(0)
        .prop('title')
    ).to.equal('Edit');
    expect(
      wrapper
        .find(Tooltip)
        .at(1)
        .prop('title')
    ).to.equal('Delete');
  });
  
  it('should render InfoIcon when info is true', () => {
    wrapper.setProps({ ...props, info: true });
    expect(wrapper.find(Tooltip).length).to.eq(1);
    expect(
      wrapper
        .find(IconButton)
        .childAt(0)
        .name()
    ).to.equal('InfoIcon');
  });

  it('should not render Icons when isHidden is true', () => {
    wrapper.setProps({ ...props, isHidden: () => true, info: false });
    expect(wrapper.find(IconButton).length).to.eq(0);
  });

  it('should call onClick with node when TrashIcon is clicked', () => {
    wrapper
      .find(Tooltip)
      .dive()
      .at(0)
      .find(IconButton)
      .dive()
      .simulate('click');
    expect(props.onClick.calledWith(props.node)).to.be.true;
  });
  
  it('should render EditIcon when edit is true', () => {
    wrapper.setProps({ ...props, info:false,edit: true });
    expect(wrapper.find(Tooltip).length).to.eq(1);
    expect(
      wrapper
        .find(IconButton)
        .childAt(0)
        .name()
    ).to.equal('EditIcon');
  });
});
