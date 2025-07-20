import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { CountryStoreMock, RegionStoreMock, SettingsStoreMock } from '../../Shared/Mocks';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import CoreModule from '../Core.module';
import { AccessLevelModel, SourceTypeModel, StatusTypeModel } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';

describe('Country Core Module', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;
  let searchHeader: any;
  const store = {
    countryStore: new CountryStoreMock(),
    settingsStore: new SettingsStoreMock(),
    sidebarStore: SidebarStore,
    regionStore: new RegionStoreMock(),
  };

  const customAgGridReact = (): ShallowWrapper => wrapper.find(CustomAgGridReact);

  beforeEach(() => {
    wrapper = shallow(<CoreModule {...store} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
    searchHeader = wrapper.find(SearchHeaderV3);
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(searchHeader).to.have.length(1);
    expect(customAgGridReact()).to.have.length(1);
  });

  it('should add 11 columns in the table', () => {
    expect(wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs).to.have.length(11);
  });

  it('should call onFilterChange function and update state', () => {
    searchHeader.props().onFiltersChanged();
    expect(store.countryStore.countries.length).greaterThan(0);
  });

  it('should render the react node with rightContent function', () => {
    const _rightContent = searchHeader.props().rightContent();
    expect(_rightContent).to.be.an('object');
  });

  it('should format values correctly in column definitions', () => {
    const mockData = {
      value: { name: 'Mock Name', label: 'Mock Label' },
    };
    const fieldsToCheck = ['sovereignCountry', 'status', 'accessLevel', 'sourceType'];
    agGridHelper.validateColumnFormatting(fieldsToCheck, mockData);
  });

  it('should compare values correctly in column definitions', () => {
    const mockAccessLevel1 = new AccessLevelModel({ id: 1, name: 'Level 1' });
    const mockAccessLevel2 = new AccessLevelModel({ id: 2, name: 'Level 2' });
    const mockSourceType1 = new SourceTypeModel({ id: 1, name: 'Type 1' });
    const mockSourceType2 = new SourceTypeModel({ id: 2, name: 'Type 2' });
    agGridHelper.compareColumnValues(['accessLevel'], mockAccessLevel1, mockAccessLevel2);
    agGridHelper.compareColumnValues(['sourceType'], mockSourceType1, mockSourceType2);
  });

  it('action menus correctly in column definitions', () => {
    const agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.validateActionMenus(5);
  });

  it('should get correct values from filterValueGetter in column definitions', () => {
    const fieldsToCheck = ['sovereignCountry', 'status'];
    const mockData = {
      data: {
        sovereignCountry: { name: 'Name' },
        status: new StatusTypeModel({ name: 'Name' }),
      },
    };
    const expectedValue = 'Name';

    agGridHelper.testFilterValueGetter(fieldsToCheck, mockData, expectedValue);
  });
});
