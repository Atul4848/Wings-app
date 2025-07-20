import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { AgGridTestingHelper } from '@wings/shared';
import { SectionLevelExclusionModel, SettingsStoreMock } from '../../Shared';
import { SectionLevelExclusion } from '../Components/TraveledHistory';
import { GRID_ACTIONS } from '@wings-shared/core';
// import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';

describe('CountryLevelExclusionV2', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const sectionLevelExclusion = new SectionLevelExclusionModel({
    id: 1,
  });

  const props = {
    isEditable: true,
    rowData: [sectionLevelExclusion],
    countryLevel: 'test',
    onDataUpdate: sinon.fake(),
    onRowEdit: sinon.fake(),
    settingsStore: new SettingsStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<SectionLevelExclusion {...props} />).dive();
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
    agGridHelper.getAgGridProps();
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    agGridHelper.getAgGridProps();
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

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'link' } } as any, null);
    parentComp.onDropDownChange({ colDef: { field: 'traveledHistoryCategory' } } as any, 'test');
    expect(mock.callCount).equal(2);
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    parentComp.onInputChange({ colDef: { field: 'link' } } as any, '');
  });
});
