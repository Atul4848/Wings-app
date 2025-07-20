import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PureAgGridActionMenu } from '../Components/AgGridActionMenu/AgGridActionMenu';
import { RowNode } from 'ag-grid-community';
import { createTheme } from '@material-ui/core/styles';
import { LightTheme } from '@uvgo-shared/themes';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('AgGrid Action Menu', () => {
  let wrapper: ShallowWrapper;
  const theme = createTheme(LightTheme);
  const onAction = sinon.spy((actionType: GRID_ACTIONS, rowIndex: number) => '');

  const props = {
    classes: {},
    node: new RowNode(),
    theme,
    dropdownItems: () => [
      { title: 'Edit', isHidden: false, action: GRID_ACTIONS.EDIT },
      { title: 'View', isHidden: false, action: GRID_ACTIONS.VIEW, to: () => '' },
    ],
    onMenuItemClick: sinon.fake(),
    onAction,
  };

  beforeEach(() => {
    wrapper = shallow(<PureAgGridActionMenu {...props} />);
  });

  afterEach(() => wrapper.unmount());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  // it('should called parent click method', () => {
  //   const dropdownItem = shallow(<div>{wrapper.find('Dropdown').prop('popperContent')}</div>);
  //   dropdownItem
  //     .find('ViewPermission')
  //     .at(0)
  //     .dive()
  //     .simulate('Click');
  //   expect(props.onMenuItemClick.calledOnce).to.be.true;
  // });
});
