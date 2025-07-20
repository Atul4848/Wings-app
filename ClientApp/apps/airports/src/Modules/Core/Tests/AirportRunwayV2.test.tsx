import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AirportRunwayModel, AirportSettingsStoreMock, AirportStoreMock } from '../../Shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { SidebarStore } from '@wings-shared/layout';
import { AgGridTestingHelper } from '@wings/shared';
import { ExpandCollapseButton } from '@wings-shared/form-controls';
import { AccessLevelModel, SourceTypeModel, SettingsTypeModel } from '@wings-shared/core';
import { AirportRunway } from '../Components';

describe('AirportRunwayV2 Component', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const data = new AirportRunwayModel({
    id: 1,
    name: 'TEST',
    airportId: 45,
  });

  const props = {
    airportStore: new AirportStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<AirportRunway {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('renders CustomAgGridReact component', () => {
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
  });

  it('should add 16 columns in the table', () => {
    expect(agGridHelper.getGridOptions().columnDefs).to.have.length(16);
  });

  it('should render the ExpandCollapseButton', () => {
    const expandCollapseButton = wrapper.find(ExpandCollapseButton);
    expandCollapseButton.props().onExpandCollapse();
    expect(expandCollapseButton).to.have.length(1);
  });

  it('should format values correctly in column definitions', () => {
    const mockData = {
      value: { name: 'Mock Name', label: 'Mock Label' },
    };
    const fieldsToCheck = [
      'runwaySurfaceTreatment',
      'runwaySurfacePrimaryType',
      'runwaySurfaceSecondaryType',
      'runwayLightType',
      'runwayCondition',
      'accessLevel',
      'sourceType',
      'status'
    ];
    agGridHelper.validateColumnFormatting(fieldsToCheck, mockData);
  });

  it('should compare values correctly in column definitions', () => {
    const mockAccessLevel1 = new AccessLevelModel({ id: 1, name: 'Level 1' });
    const mockAccessLevel2 = new AccessLevelModel({ id: 2, name: 'Level 2' });
    const mockSourceType1 = new SourceTypeModel({ id: 1, name: 'Type 1' });
    const mockSourceType2 = new SourceTypeModel({ id: 2, name: 'Type 2' });
    const mockStatus1 = new SettingsTypeModel({ id: 1, name: 'Active' });
    const mockStatus2 = new SettingsTypeModel({ id: 2, name: 'InActive' });
    agGridHelper.compareColumnValues(['accessLevel'], mockAccessLevel1, mockAccessLevel2);
    agGridHelper.compareColumnValues(['sourceType'], mockSourceType1, mockSourceType2);
    agGridHelper.compareColumnValues(['status'], mockStatus1, mockStatus2);
  });

  it('action menus correctly in column definitions', () => {
    agGridHelper.validateActionMenus(2);
  });

  it('should call action and action menus fucntion', () => {
    const columnDefs = agGridHelper.getGridOptions().columnDefs as any;
    columnDefs.forEach(col => {
      if (col.cellRenderer === 'actionRenderer') {
        col.cellRendererParams?.onAction();
        const edit = col.cellRendererParams?.actionMenus({ data: { id: 1 }}).at(0).to({ data: { id: 1 }});
        expect(edit).to.eq('1/edit');
        const detail = col.cellRendererParams?.actionMenus({ data: { id: 1 }}).at(1).to({ data: { id: 1 }});
        expect(detail).to.eq('1/detail');
      }
    });
  });
});
