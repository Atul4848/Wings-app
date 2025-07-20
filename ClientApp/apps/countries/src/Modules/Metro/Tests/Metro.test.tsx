import { GRID_ACTIONS, SettingsTypeModel } from '@wings-shared/core';
import { AgGridTestingHelper, ModelStatusOptions } from '@wings/shared';
import { Logger } from '@wings-shared/security';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { CountryStoreMock, SettingsStoreMock } from '../../Shared';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import Metro from '../Metro';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { SidebarStore } from '@wings-shared/layout';

describe('Metro', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    settingsStore: new SettingsStoreMock(),
    countryStore: new CountryStoreMock(),
    sidebarStore: SidebarStore
  };

  beforeEach(() => {
    sinon.stub(Logger, 'warning');
    wrapper = shallow(<Metro {...props} />).dive();
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

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    parentComp.onInputChange({ colDef: { field: 'name' } } as any, '');
  });

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'country' } } as any, 'abc');
    parentComp.onDropDownChange({ colDef: { field: 'state' } } as any, 'abc');
    expect(mock.callCount).equal(2);
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
    agGridHelper.onAction(GRID_ACTIONS.VIEW, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call upsert function on save button click', () => {
    const mock = sinon.spy(props.countryStore, 'upsertMetro');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });

  it('should open modal on audit button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.AUDIT, 0);
  });

  it('should add 10 columns in the table', () => {
    expect(wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs).to.have.length(10);
  });

  it('should compare values correctly in column definitions', () => {
    const mockData1 = new SettingsTypeModel({ id: 1, name: 'Data 1' });
    const mockData2 = new SettingsTypeModel({ id: 2, name: 'Data 2' });

    agGridHelper.compareColumnValues(
      ['country', 'state', 'city', 'status', 'accessLevel', 'sourceType'],
      mockData1,
      mockData2
    );
  });

  it('should format values correctly in column definitions', () => {
    const mockData = {
      value: { name: 'Mock Name', label: 'Mock Label' },
    };
    const fieldsToCheck = ['country', 'state', 'city', 'status', 'accessLevel', 'sourceType'];
    agGridHelper.validateColumnFormatting(fieldsToCheck, mockData);
  });

  it('action menus correctly in column definitions', () => {
    agGridHelper.validateActionMenus(2);
  });

  it('should provide the correct autocomplete options for all fields', function() {
    const fieldToOptionsMap = {
      country: props.countryStore.countries,
      state: props.countryStore.states,
      city:props.countryStore.cities,
      status: ModelStatusOptions,
      accessLevel: props.settingsStore.accessLevels,
      sourceType: props.settingsStore.sourceTypes,
    };

    agGridHelper.validateAutocompleteOptions(fieldToOptionsMap);
  });
});
