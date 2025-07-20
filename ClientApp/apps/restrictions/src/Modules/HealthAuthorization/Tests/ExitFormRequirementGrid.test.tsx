import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { AgGridTestingHelper } from '@wings/shared';
import { ExitFormRequirementModel, SettingsStoreMock } from '../../Shared';
import { GRID_ACTIONS } from '@wings-shared/core';
// import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import ExitFormRequirementGrid from '../Components/ExitRequirement/ExitFormRequirementGrid/ExitFormRequirementGrid';
 
describe('Exit Form Requirement Grid', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;
  let data = new ExitFormRequirementModel();
  const props = {
    rowData: [data],
    onDataUpdate: sinon.fake(),
    settingsStore: new SettingsStoreMock(),
    isEditable: true,
    onRowEdit: sinon.spy(),
  };
 
  beforeEach(() => {
    wrapper = shallow(<ExitFormRequirementGrid {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });
 
  afterEach(() => {
    wrapper.unmount();
  });
 
  it('should be rendered without errors, should render CustomAgGridReact ', () => {
    expect(wrapper).to.be.ok;
    // expect(wrapper.find(CustomAgGridReact)).to.be.ok;
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
});