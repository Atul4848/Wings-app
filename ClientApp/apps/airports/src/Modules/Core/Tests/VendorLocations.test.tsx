import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { AirportStoreMock } from '../../Shared';
import { GRID_ACTIONS, SettingsTypeModel } from '@wings-shared/core';
import { VendorLocations } from '../Components';
import { SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3 } from '@wings-shared/form-controls';

describe('VendorLocations', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    airportStore: new AirportStoreMock(),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<VendorLocations {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(agGridHelper.getGridOptions().columnDefs).to.have.length(9);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should compare values correctly in column definitions', () => {
    const mockVendorLevel1 = new SettingsTypeModel({ id: 1, name: 'Level 1' });
    const mockVendorLevel2 = new SettingsTypeModel({ id: 2, name: 'Level 2' });
    const mockOperationType1 = new SettingsTypeModel({ id: 1, name: 'Type 1' });
    const mockOperationType2 = new SettingsTypeModel({ id: 2, name: 'Type 2' });
    const mockStatus1 = new SettingsTypeModel({ id: 1, name: 'Active' });
    const mockStatus2 = new SettingsTypeModel({ id: 2, name: 'InActive' });
    agGridHelper.compareColumnValues(['operationalEssential.vendorLevel'], mockVendorLevel1, mockVendorLevel2);
    agGridHelper.compareColumnValues(
      ['operationalEssential.appliedOperationType'],
      mockOperationType1,
      mockOperationType2
    );
    agGridHelper.compareColumnValues(['vendorLocationStatus'], mockStatus1, mockStatus2);
  });

  it('should format values correctly in column definitions', () => {
    const mockData = {
      value: 'Mock Name',
    };
    const fieldsToCheck = [
      'vendorLocationStatus',
      'operationalEssential.appliedOperationType',
      'operationalEssential.vendorLevel',
    ];
    agGridHelper.validateColumnFormatting(fieldsToCheck, mockData);
  });

  it('action menus correctly in column definitions', () => {
    agGridHelper.validateActionMenus(1);
  });
});
