import React from 'react';
import { ShallowWrapper, shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { AgGridTestingHelper } from '@wings/shared';
import { GRID_ACTIONS, SettingsTypeModel } from '@wings-shared/core';
import { AirportFrequency } from '../Components';
import { AirportModuleSecurity, AirportSettingsStoreMock, AirportStoreMock } from '../../Shared';
import { SidebarStore } from '@wings-shared/layout';

describe('Airport FrequencyV2 Component', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    airportSettingsStore: new AirportSettingsStoreMock(),
    airportStore: new AirportStoreMock(),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<AirportFrequency {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
    sinon.stub(AirportModuleSecurity, 'isEditable').value(true);
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(agGridHelper.getGridOptions().columnDefs).to.have.length(9);
  });

  it('onInputChange should set hasError value based on changes', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onInputChange');
    parentComp.onInputChange(
      {
        colDef: { field: 'frequency' },
      } as any,
      'TEST'
    );
    expect(mock.callCount).equal(1);
  });

  it('onDropDownChange should set hasError value based on changes', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'frequencyType' }, data: new SettingsTypeModel() } as any, {
      name: 'Ground',
    });
    parentComp.onDropDownChange({ colDef: { field: 'sector' }, data: new SettingsTypeModel() } as any, { name: 'NE' });
    expect(mock.callCount).equal(2);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).to.be.false;
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).true;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call upsert function on save button click', () => {
    const mock = sinon.spy(props.airportStore, 'upsertAirportFrequency');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });
});
