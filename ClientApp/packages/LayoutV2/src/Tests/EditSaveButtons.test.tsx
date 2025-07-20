import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { EditSaveButtons } from '../Components';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';
import { expect } from 'chai';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('EditSaveButtons Tests', () => {
  let wrapper: ShallowWrapper;

  const props = {
    isEditMode: false,
    onAction: sinon.fake(),
    hasEditPermission: true,
  };

  beforeEach(() => {
    wrapper = shallow(<EditSaveButtons {...props} />);
  });

  it('should render edit button if hasEditPermission =true', () => {
    expect(wrapper.find(PrimaryButton)).to.be.ok;
  });

  it('should not render edit button if hasEditPermission =false', () => {
    wrapper.setProps({ ...props, hasEditPermission: false });
    expect(wrapper.find(PrimaryButton)).to.be.empty;
  });

  it('should call onAction with Edit button', () => {
    wrapper.find(PrimaryButton).simulate('click');
    expect(props.onAction.calledWith(GRID_ACTIONS.EDIT)).to.be.true;
  });

  it('should call onAction with CANCEL button', () => {
    wrapper.setProps({ ...props, isEditMode: true });
    wrapper.find(PrimaryButton).at(0).simulate('click');
    expect(props.onAction.calledWith(GRID_ACTIONS.CANCEL)).to.be.true;
  });

  it('should call onAction with SAVE button', () => {
     wrapper.setProps({ ...props, isEditMode: true });
    wrapper.find(PrimaryButton).at(1).simulate('click');
    expect(props.onAction.calledWith(GRID_ACTIONS.SAVE)).to.be.true;
  });
});
