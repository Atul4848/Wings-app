import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { AgGridTestingHelper, BasePermitStore, ModelStatusOptions } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { AirportStoreMock, AirportSettingsStoreMock, CustomsLeadTimeModel } from '../../Shared';
import { GRID_ACTIONS } from '@wings-shared/core';
import { LeadTimesGrid } from '../Components';

describe('LeadTimesGrid Module', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    airportStore: new AirportStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    leadTimes: [new CustomsLeadTimeModel()],
    isEditable: true,
    onDataUpdate: sinon.spy(),
    isRowEditing: (isEditing: boolean) => {},
  };

  const _permitStore = new BasePermitStore();

  beforeEach(() => {
    wrapper = shallow(<LeadTimesGrid {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(agGridHelper.getGridOptions().columnDefs).to.have.length(6);
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onInputChange');
    parentComp.onInputChange({ colDef: { field: 'leadTime' } } as any, '123');
    expect(mock.callCount).equal(1);
  });

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'customsLeadTimeType' } } as any, 'abc');
    parentComp.onDropDownChange({ colDef: { field: 'status' } } as any, 'abc');
    parentComp.onDropDownChange({ colDef: { field: 'flightOperationalCategory' } } as any, 'abc');
    expect(mock.callCount).equal(3);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).true;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call onDataUpdate function on save button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(props.onDataUpdate.calledOnce).true;
  });

  it('action menus correctly in column definitions', () => {
    const agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.validateActionMenus(2);
  });

  it('should format values correctly in column definitions', () => {
    const columnFields = ['customsLeadTimeType', 'status', 'flightOperationalCategory'];
    const mockData = {
      value: { name: 'Mock Name', label: 'Mock Label' },
    };
    agGridHelper.validateColumnFormatting(columnFields, mockData);
  });

  it('should provide the correct autocomplete options for all fields', function() {
    const fieldToOptionsMap = {
      customsLeadTimeType: props.airportSettingsStore.leadTimeType,
      status: ModelStatusOptions,
      flightOperationalCategory: _permitStore.flightOperationalCategories,
    };
    agGridHelper.validateAutocompleteOptions(fieldToOptionsMap);
  });
});
