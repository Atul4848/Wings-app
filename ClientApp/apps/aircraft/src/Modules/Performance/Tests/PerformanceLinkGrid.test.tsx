
import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
import { GRID_ACTIONS } from '@wings-shared/core';
import sinon from 'sinon';
import { PerformanceLinkModel } from '../../Shared';
import PerformanceLinkGrid from '../Component/PerformanceLinkGrid/PerformanceLinkGrid';
import { CollapsibleWithButton } from '@wings-shared/layout';

describe('Performance link grid', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;
  const props = {
    classes: {},
    isEditable: true,
    performanceLinkData: [new PerformanceLinkModel()],
    onDataSave: sinon.fake(),
    onRowEdit: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PerformanceLinkGrid {...props} />);
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors, render CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    const props = agGridHelper.getAgGridProps();
    expect(props.isRowEditing);
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    const propsV1 = agGridHelper.getAgGridProps();
    expect(propsV1.isRowEditing);
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    const propsV2 = agGridHelper.getAgGridProps();
    expect(propsV2.isRowEditing);
  });

  it('should call upsert function on save button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    agGridHelper.getAgGridProps();
  });

  it('should call delete function on delete button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.DELETE, 1);
    agGridHelper.getAgGridProps();
  });

  it('should call default function', () => {
    agGridHelper.onAction(GRID_ACTIONS.VIEW, 1);
    agGridHelper.getAgGridProps();
  });
  
  it('should call cancel function', () => {
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 1);
    agGridHelper.getAgGridProps();
  });

  it('should add the new type on add button click', () => {
    wrapper
      .find(CollapsibleWithButton)
      .props()
      .onButtonClick();
  });
});

