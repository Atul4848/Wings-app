import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AirportHoursModel, AirportHoursTypeModel, AirportSettingsStoreMock } from '../../Shared';
import { GRID_ACTIONS, SettingsTypeModel } from '@wings-shared/core';
import { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { CommonAirportHoursGrid } from '../Components';
import { AgGridTestingHelper, AirportModel } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';

describe('CommonAirportHourGrid V2 Module', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const data = new AirportHoursModel({
    id: 1,
    icao: 'ICAO',
    airport: new AirportModel({
      id: 1,
      name: 'Test',
    }),
    airportHoursType: new AirportHoursTypeModel({ id: 1, name: 'ciq' }),
  });

  const props = {
    gridOptions: {},
    airportSettingsStore: new AirportSettingsStoreMock(),
    rowData: [data],
    onAction: (action: GRID_ACTIONS, rowIndex: number) => '',
    auditFields: [],
    isAirportScreen: false,
  };

  beforeEach(() => {
    wrapper = shallow(<CommonAirportHoursGrid {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
  });

  it('should add 13 columns in the table', () => {
    expect(agGridHelper.getGridOptions().columnDefs).to.have.length(13);
  });

  it('should format values correctly in column definitions', () => {
    const columnDefs = agGridHelper.getGridOptions().columnDefs;
    const mockData = {
      value: { name: 'Mock Name', label: 'Mock Label' },
    };
 
    columnDefs.forEach((col: ColDef) => {
      columnDefs.forEach((col: ColDef) => {
        if (typeof col.valueFormatter === 'function') {
          const formattedValue = col.valueFormatter(mockData as ValueFormatterParams);
          expect(formattedValue).to.be.oneOf(['Mock Name', 'Mock Label', '', undefined]);
        }
      });
    });
  });

  it('should compare values correctly in column definitions', () => {
    const mockStatus1 = new SettingsTypeModel({ id: 1, name: 'Active' });
    const mockStatus2 = new SettingsTypeModel({ id: 2, name: 'InActive' });
    agGridHelper.compareColumnValues(['status'], mockStatus1, mockStatus2);
  });
});
