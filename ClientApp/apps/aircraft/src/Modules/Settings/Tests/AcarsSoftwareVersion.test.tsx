import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
import { GRID_ACTIONS } from '@wings-shared/core';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import sinon from 'sinon';
import { AvionicsSettingsStoreMock } from '../../Shared';
import AcarsSoftwareVersion from '../Components/AcarsSoftwareVersion/AcarsSoftwareVersion';
import { SearchHeaderV3 } from '@wings-shared/form-controls';

describe('Acars Software Version module', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    avionicsSettingsStore: new AvionicsSettingsStoreMock(),
  };

  const reRender = () => wrapper.setProps({ abc: Math.random() });

  beforeEach(() => {
    wrapper = shallow(<AcarsSoftwareVersion {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors, render CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call filter change function when isInitEvent is false', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(false);
  });

  it('should call filter change function  when isInitEvent is true', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(true);
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
    const mock = sinon.spy(props.avionicsSettingsStore, 'upsertAscarSoftwareVersion');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });

  it('should render the react node with rightContent function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .rightContent();
  });

  it('onDropDownChange should set hasError value based on changes', () => {
    const parentComp = agGridHelper.getParentComponent();
    parentComp.onDropDownChange({ colDef: { field: 'acarsModel' } } as any, '');
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    parentComp.onInputChange({ colDef: { field: 'name' } } as any, '');
  });
});
