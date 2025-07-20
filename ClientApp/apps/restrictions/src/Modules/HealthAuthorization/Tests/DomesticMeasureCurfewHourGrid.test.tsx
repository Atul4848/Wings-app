import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { AgGridTestingHelper } from '@wings/shared';
import { DomesticMeasureCurfewHourModel, RestrictionModuleSecurity, SettingsStoreMock } from '../../Shared';
import { GRID_ACTIONS } from '@wings-shared/core';
// import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import DomesticMeasureCurfewHourGrid from '../Components/DomesticMeasure/DomesticMeasureCurfewHourGrid/DomesticMeasureCurfewHourGrid';
import { ChildGridWrapper } from '@wings-shared/layout';
import { PrimaryButton } from '@uvgo-shared/buttons';

describe('DomesticMeasureCurfewHourGrid', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;
  let data = new DomesticMeasureCurfewHourModel();

  const props = {
    rowData: [data],
    onDataUpdate: sinon.fake(),
    settingsStore: new SettingsStoreMock(),
    isEditable: true,
    onRowEdit: sinon.spy(),
  };

  beforeEach(() => {
    wrapper = shallow(<DomesticMeasureCurfewHourGrid {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    sinon.stub(RestrictionModuleSecurity, 'isEditable').value(true);
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
    expect(props.isRowEditing).false;
  });

  it('agGrid Action', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    const propsV2 = agGridHelper.getAgGridProps();
    expect(propsV2.isRowEditing).false;
    agGridHelper.onAction(GRID_ACTIONS.AUDIT, 0);
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    agGridHelper.onAction(GRID_ACTIONS.DELETE, 1);
    props.onRowEdit(false);
  });

  it('should call addNewRecord when PrimaryButton is clicked', () => {
    wrapper.setProps({ ...props, isEditable: false });
    const primaryButton = wrapper
      .find(ChildGridWrapper)
      .dive()
      .dive()
      .find(PrimaryButton);
    primaryButton.simulate('click');
  });

  it('should call dataUpdate on save button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(props.onDataUpdate.called).to.be.true;
  });

  it('should call dataUpdate on save button click', () => {
    const model = [new DomesticMeasureCurfewHourModel({ id: 1 })];
    agGridHelper.onAction(GRID_ACTIONS.DELETE, 1);
    expect(props.onDataUpdate.called).to.be.true;
  });
});
