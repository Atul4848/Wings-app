import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
import { GRID_ACTIONS } from '@wings-shared/core';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import sinon from 'sinon';
import { AircraftModelMakeModel, SettingsStoreMock } from '../../Shared';
import { AircraftModelMakeMasterDetail } from '../Components/AircraftModels/Components';
import { CollapsibleWithButton } from '@wings-shared/layout';

describe('AircraftModelMakeMasterDetail module', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const makeModel = new AircraftModelMakeModel({
    id: 1,
  });

  const props = {
    modelMakes: [makeModel],
    settingsStore: new SettingsStoreMock(),
    onDataSave: sinon.fake(),
    onRowEditing: sinon.fake(),
  };

  const reRender = () => wrapper.setProps({ abc: Math.random() });

  beforeEach(() => {
    wrapper = shallow(<AircraftModelMakeMasterDetail {...props} />);
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors, render CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(wrapper.find(CollapsibleWithButton)).to.have.length(1);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).true;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    reRender();
    expect(props.onRowEditing.called).to.be.true;
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).true;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('Grid action SAVE should set data in grid', () => {
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(props.onDataSave.called).to.be.true;
  });

  it('should call delete function on delete button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.DELETE, 1);
    agGridHelper.getAgGridProps();
  });
});
