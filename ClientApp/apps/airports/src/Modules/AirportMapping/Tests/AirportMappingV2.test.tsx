import { GRID_ACTIONS } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';
import { Logger } from '@wings-shared/security';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { AirportMappingsStoreMock } from '../../Shared';
import AirportMapping from '../AirportMappingV2';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { SidebarStore } from '@wings-shared/layout';

describe('Airport Mapping Module V2', () => {
  let wrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    airportMappingsStore: new AirportMappingsStoreMock(),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    sinon.stub(Logger, 'warning');
    wrapper = shallow(<AirportMapping {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
  });

  it('should add 4 columns in the table', () => {
    expect(agGridHelper.getGridOptions().columnDefs).to.have.length(4);
  });

  it('action menus correctly in column definitions', () => {
    agGridHelper.validateActionMenus(2);
  });

  it('should format values correctly in column definitions', () => {
    const mockData = {
      value: 'Mock Name',
    };
    const fieldsToCheck = ['navblueCode', 'apgCode'];
    agGridHelper.validateColumnFormatting(fieldsToCheck, mockData);
  });

  it('should call action fucntion', () => {
    const columnDefs = agGridHelper.getGridOptions().columnDefs as any;
    columnDefs.forEach((col) => {
      if (col.cellRenderer === 'actionRenderer') {
        col.cellRendererParams?.onAction(GRID_ACTIONS.EDIT, null);
        col.cellRendererParams?.onAction(GRID_ACTIONS.EDIT, 1);
        col.cellRendererParams?.onAction(GRID_ACTIONS.DELETE, 1);
      }
    });
  });
});
