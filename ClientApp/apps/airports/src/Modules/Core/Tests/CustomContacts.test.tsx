import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { AgGridTestingHelper } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { AirportStoreMock, AirportSettingsStoreMock, AirportCustomDetailStoreMock } from '../../Shared';
import { GRID_ACTIONS } from '@wings-shared/core';
import { CustomContacts } from '../Components';

describe('CustomContacts', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    airportStore: new AirportStoreMock(),
    airportCustomDetailStore: new AirportCustomDetailStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    isEditable: true,
    isRowEditing: (isEditing: boolean) => {},
  };

  beforeEach(() => {
    wrapper = shallow(<CustomContacts {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(agGridHelper.getGridOptions().columnDefs).to.have.length(8);
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onInputChange');
    parentComp.onInputChange({ colDef: { field: 'contactName' } } as any, 'Test');
    parentComp.onInputChange({ colDef: { field: 'contactValue' } } as any, 'Test');
    expect(mock.callCount).equal(2);
  });

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'customsContactType' } } as any, 'abc');
    parentComp.onDropDownChange({ colDef: { field: 'status' } } as any, 'abc');
    parentComp.onDropDownChange({ colDef: { field: 'customsContactAddressType' } } as any, 'abc');
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

  it('should call upsert function on save button click', () => {
    const upsertSpy = sinon.spy(props.airportCustomDetailStore, 'upsertCustomsContact');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(upsertSpy.calledOnce).true;
  });
});
