import { GRID_ACTIONS, IdNameCodeModel } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { SettingsStoreMock } from '../../Shared';
import { Team } from '../Components';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { PrimaryButton } from '@uvgo-shared/buttons';

describe('Team Component', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    settingsStore: new SettingsStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<Team {...props} />).dive();
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

  it('should call filter change function when isInitEvent is false', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(false);
  });

  it('should call filter change function  when isInitEvent is true', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(true);
  });

  it('should render the react node with rightContent function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .rightContent();
  });

  it('should call delete function on delete button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.DELETE, 0);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    const props = agGridHelper.getAgGridProps();
    expect(props.isRowEditing).false;
  });

  it('should compare values correctly in column definitions', () => {
    const mockData1 = new IdNameCodeModel({ id: 1, code: 'code 1', name: 'Data 1' });
    const mockData2 = new IdNameCodeModel({ id: 2, code: 'code 2', name: 'Data 2' });
    agGridHelper.compareColumnValues(['country'], mockData1, mockData2);
  });

  it('should cancel editing when CANCEL action is invoked', () => {
    const mockRowIndex = 0;
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, mockRowIndex);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should start editing when EDIT action is invoked', () => {
    const mockRowIndex = 0;
    agGridHelper.onAction(GRID_ACTIONS.EDIT, mockRowIndex);
    expect(agGridHelper.getAgGridProps().isRowEditing).true;
  });

  it('should call upsert function on delete button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.DELETE, 0);
    const propsV2 = agGridHelper.getAgGridProps();
    expect(propsV2.isRowEditing).false;
  });

  it('should add the new type', () => {
    const primaryButton = wrapper
      .find(SearchHeaderV3)
      .dive()
      .dive()
      .find(PrimaryButton)
      .at(0);
    primaryButton.simulate('click');
  });

  it('should call upsert function on save button click', () => {
    const mock = sinon.spy(props.settingsStore, 'upsertTeams');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });
});
