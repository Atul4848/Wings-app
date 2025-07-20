import { GRID_ACTIONS } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';
import { Logger } from '@wings-shared/security';
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { TimeZoneSettingsStoreMock, TimeZoneStoreMock } from '../../Shared';
import Sinon from 'sinon';
import CoreModule from '../Core.module';
import { SearchHeaderV3 } from '@wings-shared/form-controls';

describe('Time Zones Module', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;
  const sidebarStoreMock = { setNavLinks: Sinon.fake() };

  const props = {
    timeZoneStore: new TimeZoneStoreMock(),
    timeZoneSettingsStore: new TimeZoneSettingsStoreMock(),
    sidebarStore: sidebarStoreMock,
  };

  beforeEach(() => {
    sinon.stub(Logger, 'warning');
    wrapper = mount(<CoreModule {...props} />);
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
    expect(propsV1.isRowEditing).to.be.true;
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

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    parentComp.onInputChange({ colDef: { field: 'startDateTime' } } as any, '');
    parentComp.onInputChange({ colDef: { field: 'endDateTime' } } as any, '');
  });

  it('should call reset filter function on reset button click', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onResetFilterClick();
  });

  it('should call filter change function when isInitEvent is false', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(false);
  });

  it('should call filter change function  when isInitEvent is true', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(true);
  });

});

