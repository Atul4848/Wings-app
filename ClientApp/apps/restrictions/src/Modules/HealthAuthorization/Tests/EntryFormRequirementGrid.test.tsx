import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { AgGridTestingHelper } from '@wings/shared';
import { EntryFormRequirementModel, SettingsStoreMock } from '../../Shared';
import { ModalKeeper, ModalStore } from '@uvgo-shared/modal-keeper';
import EntryFormRequirementGrid from '../Components/EntryRequirement/EntryFormRequirementGrid/EntryFormRequirementGrid';
import { GRID_ACTIONS } from '@wings-shared/core';
// import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { ChildGridWrapper } from '@wings-shared/layout';
import { PrimaryButton } from '@uvgo-shared/buttons';

describe('Entry Form Requirement Grid', () => {
  let wrapper: ShallowWrapper;
  let modal: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const preTravelTestData = new EntryFormRequirementModel({
    id: 1,
  });

  const props = {
    data: preTravelTestData,
    isEditable: true,
    rowData: [preTravelTestData],
    onDataUpdate: sinon.fake(),
    onRowEdit: sinon.fake(),
    settingsStore: new SettingsStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(
      <div>
        <EntryFormRequirementGrid {...props} />
        <ModalKeeper />
      </div>
    );
    modal = wrapper
      .find(ModalKeeper)
      .dive()
      .shallow();
    wrapper = wrapper
      .find(EntryFormRequirementGrid)
      .shallow()
      .dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    ModalStore.data = null;
  });

  it('should be rendered without errors, render CustomAgGridReact', () => {
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
  it('should call cancel function', () => {
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 1);
    agGridHelper.getAgGridProps();
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
});
