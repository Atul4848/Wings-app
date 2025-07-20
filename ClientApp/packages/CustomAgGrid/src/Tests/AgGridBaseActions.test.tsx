import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { createTheme } from '@material-ui/core/styles';
import { LightTheme } from '@uvgo-shared/themes';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { AgGridBaseActions } from '../Components';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('AgGridBaseActions', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;
  const theme = createTheme(LightTheme);
  const getDisabledState = sinon.fake();
  const onAction = sinon.fake((actionType: GRID_ACTIONS, rowIndex: number) => '');

  const props = {
    theme,
    isRowEditing: false,
    showDeleteButton: true,
    classes: {},
    getDisabledState,
    onAction,
    value: '',
    rowIndex: 0,
  };

  beforeEach(() => {
    wrapper = shallow(<AgGridBaseActions {...props} />);
    wrapperInstance = wrapper.instance();
  });

  afterEach(() => wrapper.unmount());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should AgGridBaseActions be refreshed', () => {
    expect(wrapperInstance.refresh('')).to.true;
  });

  it('should getValue', () => {
    expect(wrapperInstance.getValue()).to.eq(props.value);
  });

  it('should call onAction with Edit Button in renderActions', () => {
    shallow(<div>{wrapperInstance.renderActions}</div>)
      .find(PrimaryButton)
      .at(0)
      .simulate('click', null);
    expect(onAction.calledWith(GRID_ACTIONS.EDIT, props.rowIndex)).to.true;
  });

  it('should call onAction with Delete Button in renderActions', () => {
    shallow(<div>{wrapperInstance.renderActions}</div>)
      .find(PrimaryButton)
      .at(1)
      .simulate('click', null);
    expect(onAction.calledWith(GRID_ACTIONS.DELETE, props.rowIndex)).to.true;
  });

  it('should call onAction with Cancel Button in editActions', () => {
    wrapper.setProps({ isRowEditing: true });
    shallow(<div>{wrapperInstance.editActions}</div>)
      .find(PrimaryButton)
      .at(1)
      .simulate('click', null);
    expect(onAction.calledWith(GRID_ACTIONS.CANCEL, props.rowIndex)).to.true;
  });
});
