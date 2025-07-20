import React from 'react';
import { expect } from 'chai';
import { CountryStoreMock, RegionStoreMock, SettingsStoreMock } from '../../Shared/Mocks';
import { AgGridTestingHelper, ModelStatusOptions, RegionModel } from '@wings/shared';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import { AgGridMasterDetails, CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { GRID_ACTIONS, SettingsTypeModel } from '@wings-shared/core';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Progress } from '@uvgo-shared/progress';
import AssociatedRegion from '../AssociatedRegion/AssociatedRegion';

describe('Associated Region Module', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    data: new RegionModel({ id: 1, name: 'test' }),
    regionStore: new RegionStoreMock(),
    countryStore: new CountryStoreMock(),
    settingsStore: new SettingsStoreMock(),
    isMasterDetails: true,
  };

  const reRender = () => wrapper.setProps({ abc: Math.random() });

  beforeEach(() => {
    wrapper = shallow(<AssociatedRegion {...props} />);
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors, render AgGridMasterDetails', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(AgGridMasterDetails)).to.have.length(1);
  });

  it('should render AgGrid', () => {
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

  it('should render audit history on click audit', () => {
    agGridHelper.onAction(GRID_ACTIONS.AUDIT, 1);
    const auditHistory = shallow(<div>{ModalStore.data}</div>);
    expect(auditHistory).to.have.length(1);
    reRender();
  });

  it('should trigger render method if loader is loading', () => {
    wrapper.setProps({ isMasterDetails: false });
    expect(wrapper.find(Progress)).to.be.exist;
  });

  it('should add 9 columns in the table', () => {
    expect(wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs).to.have.length(9);
  });

  it('should compare values correctly in column definitions', () => {
    const mockData1 = new SettingsTypeModel({ id: 1, name: 'Data 1' });
    const mockData2 = new SettingsTypeModel({ id: 2, name: 'Data 2' });

    agGridHelper.compareColumnValues(
      ['region', 'region.regionType', 'country', 'state', 'status', 'accessLevel', 'sourceType'],
      mockData1,
      mockData2
    );
  });

  it('should format values correctly in column definitions', () => {
    const mockData = {
      value: { name: 'Mock Name', label: 'Mock Label' },
    };
    const fieldsToCheck = ['region', 'region.regionType', 'country', 'state', 'status', 'accessLevel', 'sourceType'];
    agGridHelper.validateColumnFormatting(fieldsToCheck, mockData);
  });

  it('action menus correctly in column definitions', () => {
    agGridHelper.validateActionMenus(2);
  });

  it('should correctly determine the disabled state for relevant columns', function() {
    const fieldsToCheck = ['region', 'state', 'country'];
    const disabledColumns = ['region', 'state', 'country'];
    const mockData = { id: 1 };

    agGridHelper.testDisabledStateForColumns(fieldsToCheck, disabledColumns, mockData);
  });

  it('should provide the correct autocomplete options for all fields', function() {
    const fieldToOptionsMap = {
      country: props.countryStore.countries,
      state: props.countryStore.states,
      status: ModelStatusOptions,
      accessLevel: props.settingsStore.accessLevels,
      sourceType: props.settingsStore.sourceTypes,
    };

    agGridHelper.validateAutocompleteOptions(fieldToOptionsMap);
  });

  it('should call upsert function on save button click', () => {
    const mock = sinon.spy(props.regionStore, 'upsertAssociatedRegion');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'country' } } as any, null);
    parentComp.onDropDownChange({ colDef: { field: 'aeronauticalInformationPublication.link' } } as any, 'abc');
    expect(mock.callCount).equal(2);
  });
});
