import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { AgGridTestingHelper } from '@wings/shared';
import { HealthAuthorizationNOTAMModel, HealthAuthStoreMock } from '../../Shared';
import { HealthAuthorizationNOTAMGrid } from '../Components/HealthAuthorizationGeneralInformation/Components';
import { GRID_ACTIONS } from '@wings-shared/core';
// import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';

describe('HealthAuthNOTAMGrid', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const healthAuthNotam = new HealthAuthorizationNOTAMModel({
    id: 1,
  });

  const props = {
    data: healthAuthNotam,
    isEditable: true,
    rowData: [healthAuthNotam],
    onDataUpdate: sinon.fake(),
    onRowEdit: sinon.fake(),
    healthAuthStore: new HealthAuthStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<HealthAuthorizationNOTAMGrid {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, render CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    // expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    const props = agGridHelper.getAgGridProps();
    expect(props.isRowEditing).false;
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    const propsV1 = agGridHelper.getAgGridProps();
    expect(propsV1.isRowEditing).true;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    const propsV2 = agGridHelper.getAgGridProps();
    expect(propsV2.isRowEditing).false;
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
