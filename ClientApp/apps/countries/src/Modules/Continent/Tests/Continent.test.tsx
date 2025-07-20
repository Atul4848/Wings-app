import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import Continent from '../Continent';
import { CountryStoreMock, SettingsStoreMock } from '../../Shared/Mocks';
import { AgGridTestingHelper, ModelStatusOptions } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import * as sinon from 'sinon';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { GRID_ACTIONS, SettingsTypeModel } from '@wings-shared/core';
import { SidebarStore } from '@wings-shared/layout';

describe('Continent Module', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;
  const addContinents = sinon.fake();
  const props = {
    countryStore: new CountryStoreMock(),
    settingsStore: new SettingsStoreMock(),
    addContinents,
    sidebarStore: SidebarStore,
  };

  const reRender = () => wrapper.setProps({ abc: Math.random() });

  beforeEach(() => {
    wrapper = shallow(<Continent {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render SearchHeader', () => {
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
  });

  it('should render CustomAgGridReact', () => {
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
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
  it('should call filter change function when isInitEvent is false', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(false);
  });

  it('should call filter change function  when isInitEvent is true', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(true);
  });
  it('should call upsert function on save button click', () => {
    const mock = sinon.spy(props.countryStore, 'upsertContinent');
    const { onAction } = agGridHelper.getCellEditorParams();
    onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });
  it('should open AuditHistory on Grid action AUDIT', () => {
    agGridHelper.onAction(GRID_ACTIONS.AUDIT, 1);
    const auditHistory = shallow(<div>{ModalStore.data}</div>);
    expect(auditHistory).to.have.length(1);
  });
  it('should render the react node with rightContent function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .rightContent();
  });

  it('should add 7 columns in the table', () => {
    expect(wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs).to.have.length(7);
  });

  it('should compare values correctly in column definitions', () => {
    const mockData1 = new SettingsTypeModel({ id: 1, name: 'Data 1' });
    const mockData2 = new SettingsTypeModel({ id: 2, name: 'Data 2' });
    agGridHelper.compareColumnValues(['status', 'accessLevel', 'sourceType'], mockData1, mockData2);
  });

  it('action menus correctly in column definitions', () => {
    agGridHelper.validateActionMenus(3);
  });

  it('should provide the correct autocomplete options for all fields', function() {
    const fieldToOptionsMap = {
      status: ModelStatusOptions,
      accessLevel: props.settingsStore.accessLevels,
      sourceType: props.settingsStore.sourceTypes,
    };
    agGridHelper.validateAutocompleteOptions(fieldToOptionsMap);
  });

  it('should format values correctly in column definitions', () => {
    const mockData = {
      value: { name: 'Mock Name', label: 'Mock Label' },
    };
    const fieldsToCheck = ['state', 'status', 'accessLevel', 'sourceType'];
    agGridHelper.validateColumnFormatting(fieldsToCheck, mockData);
  });

  it('should call upsert function on save button click', () => {
    const mock = sinon.spy(props.countryStore, 'upsertContinent');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });
});
