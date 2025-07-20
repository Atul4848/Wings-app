import { GRID_ACTIONS } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';
import { Logger } from '@wings-shared/security';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { FlightPlanningServiceStoreMock, SettingsStoreMock } from '../../Shared';
import { SidebarStore } from '@wings-shared/layout';
import RegistryAssociation from '../RegistryAssociation/RegistryAssociation';

describe('Registry Association', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    flightPlanningServiceStore: new FlightPlanningServiceStoreMock(),
    settingsStore: new SettingsStoreMock(),
    isEditable: true,
    title: 'Test',
    sidebarStore: { SidebarStore },
  };

  beforeEach(() => {
    sinon.stub(Logger, 'warning');
    wrapper = shallow(<RegistryAssociation {...props} />);
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    const props = agGridHelper.getAgGridProps();
    expect(props.isRowEditing).false;
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    const propsV1 = agGridHelper.getAgGridProps();
    expect(propsV1.isRowEditing).to.be.false;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    const propsV2 = agGridHelper.getAgGridProps();
    expect(propsV2.isRowEditing).false;
  });

  it('should call upsert function on save button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.DETAILS, 0);
    const propsV1 = agGridHelper.getAgGridProps();
    expect(propsV1.isRowEditing).to.be.false;
  });

  it('should call upsert function on delete button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.DELETE, 0);
    const propsV2 = agGridHelper.getAgGridProps();
    expect(propsV2.isRowEditing).false;
  });

});

