import {
  AccessLevelModel,
  GRID_ACTIONS,
  SettingsTypeModel,
  SourceTypeModel,
  StatusTypeModel,
} from '@wings-shared/core';
import { AgGridTestingHelper, ModelStatusOptions } from '@wings/shared';
import { Logger } from '@wings-shared/security';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { CountryStoreMock, SettingsStoreMock, FirStoreMock } from '../../Shared';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import FIRsOwn from '../FIRsOwn';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { SidebarStore } from '@wings-shared/layout';

describe('FIRsOwn', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    firStore: new FirStoreMock(),
    settingsStore: new SettingsStoreMock(),
    countryStore: new CountryStoreMock(),
    showSearchHeader: true,
    countryId: 1,
    sidebarStore: SidebarStore
  };

  beforeEach(() => {
    sinon.stub(Logger, 'warning');
    wrapper = shallow(<FIRsOwn {...props} />).dive();
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
    const mock = sinon.spy(props.firStore, 'upsertFIRControllingCountry');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });

  it('should open modal on audit button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.AUDIT, 0);
    const auditHistory = shallow(<div>{ModalStore.data}</div>);
    expect(auditHistory).to.have.length(1);
  });

  it('should add 9 columns in the table', () => {
    expect(wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs).to.have.length(9);
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

  it('should provide the correct autocomplete options for all fields', function() {
    const fieldToOptionsMap = {
      firControllingCountries: props.countryStore.countries,
      firLandmassCountries: props.countryStore.countries,
      status: ModelStatusOptions,
      accessLevel: props.settingsStore.accessLevels,
      sourceType: props.settingsStore.sourceTypes,
    };
    agGridHelper.validateAutocompleteOptions(fieldToOptionsMap);
  });

  it('should format values correctly in column definitions', () => {
    const mockData = {
      value: 'Mock Name',
    };
    const fieldsToCheck = ['accessLevel', 'sourceType', 'status'];
    agGridHelper.validateColumnFormatting(fieldsToCheck, mockData);
  });

});
