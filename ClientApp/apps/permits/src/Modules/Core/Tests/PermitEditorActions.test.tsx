import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PermitEditorActions } from '../Components';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { VIEW_MODE } from '@wings/shared';
import { ViewPermission } from '@wings-shared/core';

describe('Permit Editor Actions', () => {
  let wrapper: ShallowWrapper;
  let instance: any;

  const props = {
    isDetailsView: false,
    isEditable: true,
    hasError: false,
    onSetViewMode: sinon.fake(),
    onCancelClick: sinon.fake(),
    onUpsert: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PermitEditorActions {...props} />);
    instance = wrapper.instance();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should be rendered without errors', () => {
    wrapper.setProps({ ...props,  isDetailsView: false });
    expect(wrapper).to.have.length(1);
  });

  it('should call cancel button', () => {
    wrapper.setProps({ ...props,  isDetailsView: false });
    wrapper.find(PrimaryButton).at(0).simulate('click');
    expect(props.onCancelClick.calledOnce).to.be.true;
  });

  it('should call save button', () => {
    wrapper.setProps({ ...props,  isDetailsView: false });
    wrapper.find(PrimaryButton).at(1).simulate('click');
    expect(props.onUpsert.calledOnce).to.be.true;
  });

  it('should call edit button', () => {
    wrapper.setProps({ ...props,  isDetailsView: true });
    const primaryButton = wrapper.find(ViewPermission).find(PrimaryButton);
    primaryButton.simulate('click');
    expect(props.onSetViewMode.calledWith(VIEW_MODE.EDIT)).to.be.true;
  });

  // it('should call edit button', () => {
  //   wrapper.setProps({ isEditable: false });
  //   wrapper.find(PrimaryButton).simulate('click');
  //   expect(props.onSetViewMode.called).to.be.true;
  // });
});
