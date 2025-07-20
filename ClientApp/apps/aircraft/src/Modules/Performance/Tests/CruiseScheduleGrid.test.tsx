import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
import { CruisePolicyScheduleModel, SettingsProfileModel } from '../../Shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import sinon from 'sinon';
import CruiseScheduleGrid from '../Component/CruiseScheduleGrid/CruiseScheduleGrid';
import { CollapsibleWithButton } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Cruise Schedule grid', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    classes: {},
    isEditable: true,
    title : '',
    rowData: [new CruisePolicyScheduleModel()],
    policyList: [new SettingsProfileModel()],
    onDataSave: sinon.fake(),
    onRowEdit: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<CruiseScheduleGrid {...props} />);
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    ModalStore.data = null;
  });

  it('should be rendered without errors, render CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
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

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'schedule' } } as any, null);
    parentComp.onDropDownChange({ colDef: { field: 'description' } } as any, 'abc');
    parentComp.onDropDownChange({ colDef: { field: 'navBlueSchedule' } } as any, { name: 'abc', id: 1 });
    expect(mock.callCount).equal(3);
  });

});
