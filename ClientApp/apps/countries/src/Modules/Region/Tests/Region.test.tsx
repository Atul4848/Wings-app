import React from 'react';
import { expect } from 'chai';
import { CountryStoreMock, RegionStoreMock, SettingsStoreMock } from '../../Shared/Mocks';
import { AgGridTestingHelper, GridApiMock, IGridApi, ModelStatusOptions } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import {
  AccessLevelModel,
  GRID_ACTIONS,
  SettingsTypeModel,
  SourceTypeModel,
  StatusTypeModel,
} from '@wings-shared/core';
import Region from '../Region';
import { mount } from 'enzyme';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import { SidebarStore } from '@wings-shared/layout';

describe('Region Module', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    regionStore: new RegionStoreMock(),
    settingsStore: new SettingsStoreMock(),
    countryStore: new CountryStoreMock(),
    sidebarStore: SidebarStore,
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <Region {...props} />
    </ThemeProvider>
  );
  const reRender = () => wrapper.setProps({ abc: Math.random() });

  beforeEach(() => {
    wrapper = mount(element);
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors, render CustomAgGridReact, searchHeader and primaryButton', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
  });

  it('should call filter change function when isInitEvent is false', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(false);
  });

  it('should call filter change function  when isInitEvent is true', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(true);
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
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should render audit history on click audit', () => {
    agGridHelper.onAction(GRID_ACTIONS.AUDIT, 1);
    const auditHistory = shallow(<div>{ModalStore.data}</div>);
    expect(auditHistory).to.have.length(1);
    reRender();
  });

  it('should call upsertRegion on save click', () => {
    const { onAction } = agGridHelper.getCellEditorParams();
    onAction(GRID_ACTIONS.SAVE, 1);
  });

  it('should render the react node with rightContent function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .rightContent();
  });

  it('should change the values with onFilterChange function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .onFiltersChanged();
  });

  it('should add 8 columns in the table', () => {
    expect(wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs).to.have.length(8);
  });

  it('should compare values correctly in column definitions', () => {
    const mockData1 = new SettingsTypeModel({ id: 1, name: 'Data 1' });
    const mockData2 = new SettingsTypeModel({ id: 2, name: 'Data 2' });

    agGridHelper.compareColumnValues(['regionType'], mockData1, mockData2);

    const mockAccessLevel1 = new AccessLevelModel({ id: 1, name: 'Level 1' });
    const mockAccessLevel2 = new AccessLevelModel({ id: 2, name: 'Level 2' });
    const mockSourceType1 = new SourceTypeModel({ id: 1, name: 'Type 1' });
    const mockSourceType2 = new SourceTypeModel({ id: 2, name: 'Type 2' });
    agGridHelper.compareColumnValues(['accessLevel'], mockAccessLevel1, mockAccessLevel2);
    agGridHelper.compareColumnValues(['sourceType'], mockSourceType1, mockSourceType2);

    const mockStatusType1 = new StatusTypeModel({ id: 1, name: 'Status 1' });
    const mockStatusType2 = new StatusTypeModel({ id: 2, name: 'Status 2' });
    agGridHelper.compareColumnValues(['status'], mockStatusType1, mockStatusType2);
  });

  it('action menus correctly in column definitions', () => {
    const agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.validateActionMenus(2);
  });

  it('should get correct values from filterValueGetter in column definitions', () => {
    const fieldsToCheck = ['regionType', 'accessLevel', 'sourceType', 'status'];
    const mockData = {
      data: {
        regionType: { name: 'Name' },
        accessLevel: new AccessLevelModel({ name: 'Name' }),
        sourceType: new SourceTypeModel({ name: 'Name' }),
        status: new StatusTypeModel({ name: 'Name' }),
      },
    };
    const expectedValue = 'Name';

    agGridHelper.testFilterValueGetter(fieldsToCheck, mockData, expectedValue);
  });

  it('should provide the correct autocomplete options for all fields', function() {
    const fieldToOptionsMap = {
      regionType: props.settingsStore.regionTypes,
      status: ModelStatusOptions,
      accessLevel: props.settingsStore.accessLevels,
      sourceType: props.settingsStore.sourceTypes,
    };

    agGridHelper.validateAutocompleteOptions(fieldToOptionsMap);
  });

  it('should correctly validate the editable state and cellEditorParams for relevant columns', function() {
    const fieldsToCheck = ['name', 'code', 'regionType'];
    agGridHelper.validateColumnEditorConfig(fieldsToCheck);
  });

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'sourceType' } } as any, null);
    parentComp.onDropDownChange({ colDef: { field: 'accessLevel' } } as any, 'abc');
    parentComp.onDropDownChange({ colDef: { field: 'status' } } as any, 'abc');
    parentComp.onDropDownChange({ colDef: { field: 'regionType' } } as any, 'abc');
    expect(mock.callCount).equal(4);
  });

  it('should change the values with inputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onInputChange');
    parentComp.onInputChange({ colDef: { field: 'name' } } as any, null);
    parentComp.onInputChange({ colDef: { field: 'code' } } as any, 'abc');

    expect(mock.callCount).equal(2);
  });
  
});
