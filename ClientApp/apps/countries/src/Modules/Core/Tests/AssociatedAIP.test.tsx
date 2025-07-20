import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper, CountryModel } from '@wings/shared';
import { AgGridMasterDetails, CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { GRID_ACTIONS, SettingsTypeModel } from '@wings-shared/core';
import { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { CountryStoreMock, SettingsStoreMock } from '../../Shared';
import AssociatedAIP from './../Components/AssociatedAIPs/AssociatedAIP';
import sinon from 'sinon';

describe('Associated AIP Module', function() {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;
  const reRender = () => wrapper.setProps({ abc: Math.random() });

  const props = {
    countryStore: new CountryStoreMock(),
    settingsStore: new SettingsStoreMock(),
    countryId: 1,
    title: 'Test',
    isEditable: true,
    classes: {},
    countryModel: new CountryModel(),
  };

  const disabledColumns = [
    'aeronauticalInformationPublication.description',
    'aeronauticalInformationPublication.aipUsername',
    'aeronauticalInformationPublication.aipPassword',
  ];
  beforeEach(function() {
    wrapper = shallow(<AssociatedAIP {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(function() {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors, render AgGridMasterDetails', function() {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(AgGridMasterDetails)).to.have.length(1);
  });

  it('should not start row editing if row index is null', function() {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should start and stop row editing', function() {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).true;

    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should add 6 columns in the table', () => {
    expect(wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs).to.have.length(6);
  });

  it('should compare values correctly in column definitions', () => {
    const mockData1 = new SettingsTypeModel({ id: 1, name: 'Data 1' });
    const mockData2 = new SettingsTypeModel({ id: 2, name: 'Data 2' });

    agGridHelper.compareColumnValues(
      ['aeronauticalInformationPublication.aipSourceType', 'aeronauticalInformationPublication.link'],
      mockData1,
      mockData2
    );
  });

  it('should format values correctly in column definitions', () => {
    const paramFields = ['aeronauticalInformationPublication.link'];
    const columnFields = ['aeronauticalInformationPublication.aipSourceType'];
    const mockData = {
      value: { name: 'Mock Name', label: 'Mock Label' },
    };

    agGridHelper.validateCellEditorFormatting(paramFields,mockData);
    agGridHelper.validateColumnFormatting(columnFields,mockData);
  });

  it('should provide the correct autocomplete options for all fields', function() {
    const fieldToOptionsMap = {
      'aeronauticalInformationPublication.aipSourceType': props.settingsStore.aipSourceTypes,
    };
    agGridHelper.validateAutocompleteOptions(fieldToOptionsMap);
  });

  it('should correctly determine the disabled state for relevant columns', function() {
    const fieldsToCheck = [
      'aeronauticalInformationPublication.description',
      'aeronauticalInformationPublication.aipUsername',
      'aeronauticalInformationPublication.aipPassword',
    ];
    const mockData = { id: 1 };

    agGridHelper.testDisabledStateForColumns(fieldsToCheck, disabledColumns, mockData);
  });

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'aeronauticalInformationPublication.aipSourceType' } } as any, null);
    parentComp.onDropDownChange({ colDef: { field: 'aeronauticalInformationPublication.link' } } as any, 'abc');
    expect(mock.callCount).equal(2);
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onInputChange');
    parentComp.onInputChange({ colDef: { field: 'aeronauticalInformationPublication.description' } } as any, '');
    parentComp.onInputChange({ colDef: { field: 'aeronauticalInformationPublication.aipUsername' } } as any, '');
    parentComp.onInputChange({ colDef: { field: 'aeronauticalInformationPublication.aipPassword' } } as any, '');
    expect(mock.callCount).equal(3);
  });

  it('should call upsert function on save button click', () => {
    const mock = sinon.spy(props.countryStore, 'upsertAssociatedAIP');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });
});
