import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import ReviewActions from '../ReviewActions';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { APPROVE_REJECT_ACTIONS } from '../../../Enums';

describe('ReviewActions', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;
  const onAction = sinon.fake((action: APPROVE_REJECT_ACTIONS) => '');

  const props = {
    classes: {},
    disabled: true,
    onAction,
  };

  beforeEach(function () {
    wrapper = shallow(<ReviewActions {...props} />);
    wrapperInstance = wrapper.instance();
  });

  afterEach(function () {
    wrapper.unmount();
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.have.length(1);
  });

  it('should not render refresh button if showRefreshButton=false', function () {
    wrapper.setProps({ ...props, showRefreshButton: false });
    expect(wrapper.dive().find(PrimaryButton)).to.have.length(2);
  });

  it('should call onAction with REFRESH,APPROVE_SELECTED and REJECT_SELECTED Button', function () {
    // REFRESH case
    wrapper.dive().find(PrimaryButton).at(0).simulate('click', null);
    expect(onAction.calledWith(APPROVE_REJECT_ACTIONS.REFRESH)).to.be.true;

    // APPROVE_SELECTED case
    wrapper.dive().find(PrimaryButton).at(1).simulate('click', null);
    expect(onAction.calledWith(APPROVE_REJECT_ACTIONS.APPROVE_SELECTED)).to.be.true;

    // REJECT_SELECTED case
    wrapper.dive().find(PrimaryButton).at(2).simulate('click', null);
    expect(onAction.calledWith(APPROVE_REJECT_ACTIONS.REJECT_SELECTED)).to.be.true;
  });
});
