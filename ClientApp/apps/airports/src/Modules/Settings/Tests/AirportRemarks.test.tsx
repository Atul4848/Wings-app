import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { AgGridTestingHelper } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { GRID_ACTIONS } from '@wings-shared/core';
import { AirportHoursSubTypeModel, AirportHoursTypeModel, AirportSettingsStoreMock } from '../../Shared';
import { AirportHourRemark } from '../Components';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { PrimaryButton } from '@uvgo-shared/buttons';

describe('Airport Hour Remarks', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;
  const reRender = () => wrapper.setProps({ abc: Math.random() });

  const props = {
    airportSettingsStore: new AirportSettingsStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<AirportHourRemark {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
    sinon.stub(SettingsModuleSecurity, 'isEditable').value(true);
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors, should render CustomAgGridReact and SearchHeader ', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
    expect(agGridHelper.getGridOptions().columnDefs).to.have.length(5);
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

  it('should call upsert function on save button click', () => {
    const upsertAirportHourRemark = sinon.spy(props.airportSettingsStore, 'upsertAirportHourRemark');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(upsertAirportHourRemark.calledOnce).true;
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onInputChange');
    parentComp.onInputChange({ colDef: { field: 'name' } } as any, 'Test');
    expect(mock.callCount).equal(1);
  });

  it('should change the values with onDropDownChange function', () => {
    const hoursType = new AirportHoursTypeModel({ id: 1, name: 'SLOT' });
    const subType = new AirportHoursSubTypeModel({ id: 1, name: 'Arrival/Departure' });
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'airportHoursSubType' } } as any, subType);
    parentComp.onDropDownChange({ colDef: { field: 'airportHoursType' } } as any, hoursType);
    expect(mock.callCount).equal(2);
  });

  it('should not render Add Airport Hour Remark button if edit permission is not provided', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .rightContent();
    sinon.stub(SettingsModuleSecurity, 'isEditable').value(false);
    const addButton = wrapper
      .find(SearchHeaderV3)
      .dive()
      .dive()
      .find(PrimaryButton)
      .at(0);
    expect(addButton).to.have.length(0);
  });
});
