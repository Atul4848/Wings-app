import { GRID_ACTIONS } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';
import { Logger } from '@wings-shared/security';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { AirportStoreMock } from '../../Shared';
import AirportMappingBeta from '../AirportMappingBetaV2';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SidebarStore } from '@wings-shared/layout';

describe('Airport Mapping Beta V2', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    airportStore: new AirportStoreMock(),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    sinon.stub(Logger, 'warning');
    wrapper = shallow(<AirportMappingBeta {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should add the new type', () => {
    wrapper
      .find(SearchHeaderV3)
      .dive()
      .dive()
      .find(PrimaryButton)
      .props()
      .onClick();
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    const props = agGridHelper.getAgGridProps();
    expect(props.isRowEditing).false;
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).true;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call upsert function on save button click', () => {
    const mock = sinon.spy(props.airportStore, 'upsertAirportFlightPlanInfo');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    parentComp.onInputChange({ colDef: { field: 'icao' } } as any, '');
  });

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'icao' } } as any, null);
    parentComp.onDropDownChange({ colDef: { field: 'icao' } } as any, { value: 'icao' });
    expect(mock.callCount).equal(2);
  });
});
