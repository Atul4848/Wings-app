import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { createTheme } from '@material-ui/core/styles';
import { LightTheme } from '@uvgo-shared/themes';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { AgGridActionMenu } from '../Components';
import { PureAgGridActions } from '../Components/AgGridActions/AgGridActions';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('AgGridActions Component', () => {
  let wrapper: ShallowWrapper;
  const theme = createTheme(LightTheme);
  const onAction = sinon.spy((actionType: GRID_ACTIONS, rowIndex: number) => '');

  const props = {
    context: { theme },
    classes: {},
    getDisabledState: () => false,
    onAction,
    rowIndex: 0,
    actionMenus: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureAgGridActions {...props} />);
  });

  afterEach(() => wrapper.unmount());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render AgGridActionMenu', () => {
    wrapper.setProps({ ...props, isActionMenu: true });
    wrapper.find(AgGridActionMenu).simulate('menuItemClick', GRID_ACTIONS.EDIT);
    expect(props.onAction.called).to.be.true;
  });

  it('should not render ag grid actions', () => {
    wrapper.setProps({ ...props, hideActionButtons: true });
    expect(wrapper.find(AgGridActionMenu)).to.have.length(0);
  });

  it('should render ag grid edit actions', () => {
    wrapper.setProps({ ...props, isRowEditing: true });
    expect(wrapper.find(PrimaryButton)).to.have.length(2);
  });

  it('should call dropdownItems', () => {
    wrapper.setProps({ ...props, isActionMenu: true });
    wrapper.find(AgGridActionMenu).prop('dropdownItems')();
    expect(props.actionMenus.calledOnce).to.be.true;
  });
});
