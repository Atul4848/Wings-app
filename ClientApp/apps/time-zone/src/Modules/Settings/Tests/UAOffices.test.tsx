import { GRID_ACTIONS } from '@wings-shared/core';
import { AgGridTestingHelper, GridApiMock, IGridApi } from '@wings/shared';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { TimeZoneSettingsStoreMock } from '../../Shared';
import UAOffices from '../Components/UAOffices/UAOffices';

describe('UAOffices V2', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    timeZoneSettingsStore: new TimeZoneSettingsStoreMock(),
    classes: {},
    sidebarStore: SidebarStore,
  };

  const reRender = () => wrapper.setProps({ abc: Math.random() });

  beforeEach(() => {
    wrapper = shallow(<UAOffices {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
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
    const mock = sinon.spy(props.timeZoneSettingsStore, 'upsertUAOffices');
    const { onAction } = agGridHelper.getCellEditorParams();
    onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });

  it('should call filter change function when isInitEvent is false', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(false);
  });

  it('should call filter change function  when isInitEvent is true', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(true);
  });

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'airport' } } as any, null);
    expect(mock.callCount).equal(1);
  });

  it('onInputChange should set hasError value based on changes', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onInputChange');
    parentComp.onInputChange(
      {
        colDef: { field: 'name' },
      } as any,
      'TEST'
    );
    expect(mock.callCount).equal(1);
  });

  it('should handle empty search value', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onSearch('');
  });
});
