import { GRID_ACTIONS, SettingsTypeModel } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';
import { Logger } from '@wings-shared/security';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { CountryStoreMock, SettingsStoreMock } from '../../Shared';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import AeronauticalInformationPublication from '../AeronauticalInformationPublication';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { SidebarStore } from '@wings-shared/layout';

describe('AeronauticalInformationPublication', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    settingsStore: new SettingsStoreMock(),
    countryStore: new CountryStoreMock(),
    countryId: 1,
    isEditable: true,
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    sinon.stub(Logger, 'warning');
    wrapper = shallow(<AeronauticalInformationPublication {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should change the values with onFilterChange function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .onFiltersChanged();
  });

  it('should render the react node with rightContent function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .rightContent();
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    const props = agGridHelper.getAgGridProps();
    expect(props.isRowEditing).false;
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).true;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call upsert function on save button click', () => {
    const mock = sinon.spy(props.countryStore, 'upsertAeronauticalInformationPublication');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });

  it('should call delete function on delete button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.DELETE, 0);
  });

  it('should add 6 columns in the table', () => {
    expect(wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs).to.have.length(6);
  });

  it('should compare values correctly in column definitions', () => {
    const mockData1 = new SettingsTypeModel({ id: 1, name: 'Data 1' });
    const mockData2 = new SettingsTypeModel({ id: 2, name: 'Data 2' });

    agGridHelper.compareColumnValues(['aipSourceType'], mockData1, mockData2);
  });

  it('should format values correctly in column definitions', () => {
    const mockData = {
      value: { name: 'Mock Name', label: 'Mock Label' },
    };
    const fieldsToCheck = ['aipSourceType'];
    agGridHelper.validateColumnFormatting(fieldsToCheck, mockData);
  });

  it('action menus correctly in column definitions', () => {
    agGridHelper.validateActionMenus(2);
  });

  it('should correctly determine the disabled state for relevant columns', function() {
    const fieldsToCheck = ['aipSourceType'];
    const disabledColumns = ['aipSourceType'];
    const mockData = { id: 1 };

    agGridHelper.testDisabledStateForColumns(fieldsToCheck, disabledColumns, mockData);
  });

  it('should provide the correct autocomplete options for all fields', function() {
    const fieldToOptionsMap = {
      aipSourceType: props.settingsStore.aipSourceTypes,
    };

    agGridHelper.validateAutocompleteOptions(fieldToOptionsMap);
  });

  it('should start editing when EDIT action is invoked', () => {
    const mockRowIndex = 0;
    agGridHelper.onAction(GRID_ACTIONS.EDIT, mockRowIndex);

    expect(agGridHelper.getAgGridProps().isRowEditing).true;
  });

  it('should save changes when SAVE action is invoked', () => {
    const mockRowIndex = 1;
    const mockUpsertSpy = sinon.spy(props.countryStore, 'upsertAeronauticalInformationPublication');

    agGridHelper.onAction(GRID_ACTIONS.SAVE, mockRowIndex);

    expect(mockUpsertSpy.calledOnce).to.be.true;
  });

  it('should cancel editing when CANCEL action is invoked', () => {
    const mockRowIndex = 0;
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, mockRowIndex);

    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });
});
