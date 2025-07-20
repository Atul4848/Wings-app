import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PrimaryButton } from '@uvgo-shared/buttons';
import GridReviewActions from '../GridReviewActions';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('GridReviewActions', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;
  const onAction = sinon.fake((actionType: GRID_ACTIONS) => '');

  const props = {
    classes: {},
    onAction,
    showInfoButton: true,
    showEditButton: true,
    isDisabled: false,
    disableInfo: false,
  };

  beforeEach(function() {
    wrapper = shallow(<GridReviewActions {...props} />);
    wrapperInstance = wrapper.instance();
  });

  afterEach(function() {
    wrapper.unmount();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });


  it('should call onAction with APPROVE,REJECT and DETAILS Button', function() {
    // APPROVE case
    wrapper
      .dive()
      .find(PrimaryButton)
      .at(0)
      .simulate('click');
    expect(onAction.calledWith(GRID_ACTIONS.APPROVE)).to.be.true;

    // REJECT case
    wrapper
      .dive()
      .find(PrimaryButton)
      .at(1)
      .simulate('click');
    expect(onAction.calledWith(GRID_ACTIONS.REJECT)).to.be.true;

    // EDIT case
    wrapper
      .dive()
      .find(PrimaryButton)
      .at(2)
      .simulate('click');
    expect(onAction.calledWith(GRID_ACTIONS.EDIT)).to.be.true;

    // DETAILS case
    wrapper
      .dive()
      .find(PrimaryButton)
      .at(3)
      .simulate('click');
    expect(onAction.calledWith(GRID_ACTIONS.DETAILS)).to.be.true;
  });
});
