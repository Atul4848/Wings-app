import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { AgGridTestingHelper } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import {
  AirportSettingsStoreMock,
  CustomsNoteModel,
  AirportModel,
} from '../../Shared';
import { GRID_ACTIONS } from '@wings-shared/core';
import { CappsNotesGrid } from '../Components';
import { typeCodeOptions } from '../Components/CustomDetails/CustomDetailsInfo/CustomDetailsInfo.fields';

describe('CappsNotesGrid Module', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    selectedAirport: new AirportModel(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    customsNotes: [new CustomsNoteModel()],
    isEditable: true,
    onDataUpdate: sinon.spy(),
    isRowEditing: (isEditing: boolean) => {},
  };

  beforeEach(() => {
    wrapper = shallow(<CappsNotesGrid {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(agGridHelper.getGridOptions().columnDefs).to.have.length(4);
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onInputChange');
    parentComp.onInputChange({ colDef: { field: 'notes' } } as any, '123');
    expect(mock.callCount).equal(1);
  });

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'noteType' } } as any, 'abc');
    parentComp.onDropDownChange({ colDef: { field: 'typeCode' } } as any, 'abc');
    expect(mock.callCount).equal(2);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).true;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call onDataUpdate function on save button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(props.onDataUpdate.calledOnce).true;
  });

  it('should format values correctly in column definitions', () => {
    const columnFields = ['typeCode', 'noteType'];
    const mockData = {
      value: { name: 'Mock Name', label: 'Mock Label' },
    };
    agGridHelper.validateColumnFormatting(columnFields, mockData);
  });

  it('should provide the correct autocomplete options for all fields', function() {
    const fieldToOptionsMap = {
      noteType: props.airportSettingsStore.noteTypes,
      typeCode: typeCodeOptions,
    };
    agGridHelper.validateAutocompleteOptions(fieldToOptionsMap);
  });
});
