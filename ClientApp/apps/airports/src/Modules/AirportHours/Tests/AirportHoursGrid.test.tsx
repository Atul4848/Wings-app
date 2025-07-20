import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { AirportModel, AgGridTestingHelper } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import {
  AirportSettingsStoreMock,
  AirportHoursModel,
  AirportHoursStoreMock,
  AirportHoursTypeModel,
  ConditionTypeModel,
  ConditionModel,
  ConditionValueModel,
  ConditionalOperatorModel,
} from '../../Shared';
import { AirportHoursGrid } from '../Components';
import { AccessLevelModel, GRID_ACTIONS } from '@wings-shared/core';
import { ScheduleModel } from '@wings-shared/scheduler';

describe('Hours Grid Tests', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const airportData = new AirportHoursModel({
    id: 1,
    accessLevel: new AccessLevelModel({ id: 1, name: 'private' }),
    statusId: 1,
    sourceTypeId: 1,
    schedule: new ScheduleModel({ id: 1 }),
    condition: new ConditionModel({
      id: 1,
      conditionType: new ConditionTypeModel({ id: 1, name: 'Arrival' }),
      conditionalOperator: new ConditionalOperatorModel({ id: 1, name: '=' }),
      conditionValues: [new ConditionValueModel({ id: 1, entityValue: 'true' })],
    }),
  });

  const props = {
    airportHoursStore: new AirportHoursStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    onSaveChanges: sinon.fake(),
    isOtOrRecord: false,
    isEditable: false,
    rowData: [airportData],
    airportModel: new AirportModel({ id: 1, name: 'TestAirport' }),
    airportHoursType: new AirportHoursTypeModel({
      name: 'operational',
    }),
    airportHourSubTypes: [],
    onColumnResized: (source: string) => '',
    columnResizeSource: '',
    onRowEditingStarted: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<AirportHoursGrid {...props} />)
      .dive()
      .dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(agGridHelper.getGridOptions().columnDefs).to.have.length(22);
  });

  it('set capps comment onInputBlur function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onInputBlur');
    parentComp.onInputBlur({ colDef: { field: 'notam' } } as any, '');
    expect(mock.callCount).equal(1);
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onInputChange');
    parentComp.onInputChange({ colDef: { field: 'icao' } } as any, '');
    parentComp.onInputChange({ colDef: { field: 'cappsSequenceId' }, data: { id: 1 } } as any, '');
    parentComp.onInputChange(
      { colDef: { field: 'schedule.is24Hours' }, data: { schedule: { is24Hours: true } } } as any,
      ''
    );
    expect(mock.callCount).equal(3);
  });

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'airportHoursSubType' } } as any, 'abc');
    parentComp.onDropDownChange({ colDef: { field: 'sourceType' } } as any, 'abc');
    parentComp.onDropDownChange({ colDef: { field: 'schedule.scheduleType' } } as any, 2);
    parentComp.onDropDownChange({ colDef: { field: 'schedule.stddstType' } } as any, 'abc');
    expect(mock.callCount).equal(4);
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

  it('should call upsert function on save button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(props.onSaveChanges.calledOnce).true;
  });
});
