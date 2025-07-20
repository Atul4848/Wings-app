import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';

import { SurveyReviewActions } from '../SurveyReviewActions/SurveyReviewActions';
import { Close } from '@material-ui/icons';
import sinon = require('sinon');
import { IconButton } from '@material-ui/core';

describe('SurveyReviewActions component', () => {
  let caller;

  const props = {
    isEditMode: false,
    isValid: false,
    isEvent: false,
    isDisabledApprove: false,
    ignoreHandler:() => null,
    approveHandler: () => null,
    editHandler: () => null,
    cancelHandler: () => null,
    removeHandler: () => null,
  };
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    caller = sinon.spy();
    wrapper = shallow(<SurveyReviewActions {...props} />);
  });

  it('should be rendered without errors with non Edit mode', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should be rendered without errors with Edit mode', () => {
    wrapper.setProps({ isEditMode: true });
    expect(wrapper.find(Close)).to.have.length(1);
  });

  it('ignoreHandler call if it is not isEvent and not editMode', () => {
    wrapper.setProps({ isEvent: false, isEditMode: false, ignoreHandler: caller });
    wrapper.find(IconButton).at(0).simulate('click');

    expect(caller.calledOnce).to.equal(true);
  });

  it('removeHandler call if it is isEvent and not editMode', () => {
    wrapper.setProps({ isEvent: true, isEditMode: false, removeHandler: caller });
    wrapper.find(IconButton).at(0).simulate('click');

    expect(caller.calledOnce).to.equal(true);
  });

  it('approveHandler call if it is isEvent and isDisabledApprove false', () => {
    wrapper.setProps({ isEvent: true, isEditMode: false, approveHandler: caller });
    wrapper.find(IconButton).at(1).simulate('click');

    expect(caller.calledOnce).to.equal(true);
  });

  it('editHandler call if it is isEvent', () => {
    wrapper.setProps({ isEvent: true, isEditMode: false, editHandler: caller });
    wrapper.find(IconButton).at(2).simulate('click');

    expect(caller.calledOnce).to.equal(true);
  });

  it('editHandler call if it is isEditMode and isValid', () => {
    wrapper.setProps({ isValid: true, isEditMode: true, editHandler: caller });
    wrapper.find(IconButton).at(0).simulate('click');

    expect(caller.calledOnce).to.equal(true);
  });

  it('cancelHandler call if it is isEditMode', () => {
    wrapper.setProps({ isValid: true, isEditMode: true, cancelHandler: caller });
    wrapper.find(IconButton).at(1).simulate('click');

    expect(caller.calledOnce).to.equal(true);
  });

  it('not failing with requiredProps', () => {
    const requiredProps = {
      isEditMode: false,
      isValid: false,
      isEvent: false,
      isDisabledApprove: false,
      editHandler: caller
    };

    wrapper = shallow(<SurveyReviewActions {...requiredProps} />);
    wrapper.find(IconButton).at(0).simulate('click');
    wrapper.find(IconButton).at(1).simulate('click');
    wrapper.find(IconButton).at(2).simulate('click');

    wrapper.setProps({ isEvent: true });
    wrapper.update();
    wrapper.find(IconButton).at(0).simulate('click');

    wrapper.setProps({ isEditMode: true, isValid: true });
    wrapper.update();
    wrapper.find(IconButton).at(0).simulate('click');
    wrapper.find(IconButton).at(1).simulate('click');
    expect(caller.calledOnce).to.equal(false);
  });
});
