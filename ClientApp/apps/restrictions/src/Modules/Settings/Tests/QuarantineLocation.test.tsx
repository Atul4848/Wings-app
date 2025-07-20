import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
// import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import * as sinon from 'sinon';
import { QuarantineLocation } from '../Components';

import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import { HealthAuthStoreMock } from '../../Shared';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { PrimaryButton } from '@uvgo-shared/buttons';

describe('QuarantineLocation Module', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;
  const reRender = () => wrapper.setProps({ abc: Math.random() });

  const props = {
    healthAuthStore: new HealthAuthStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<QuarantineLocation {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
    sinon.stub(SettingsModuleSecurity, 'isEditable').value(true);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, should render CustomAgGridReact and SearchHeader ', () => {
    expect(wrapper).to.have.length(1);
    // expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should stop row editing on Cancel click', () => {
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    reRender();
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

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    parentComp.onInputChange({ colDef: { field: 'name' } } as any, '');
  });

  it('should render the react node with rightContent function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .rightContent();
  });
  it('should render the react node with null on rightContent function', () => {
    sinon.stub(SettingsModuleSecurity, 'isEditable').value(false);
    wrapper
      .find(SearchHeaderV3)
      .props()
      .rightContent();
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
    const mock = sinon.spy(props.healthAuthStore, 'upsertQuarantineLocation');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });

  it('should render the react node with null on rightContent function', () => {
    sinon.stub(SettingsModuleSecurity, 'isEditable').value(false);
    expect(
      wrapper
        .find(SearchHeaderV3)
        .props()
        .rightContent()
    ).to.be.null;
  });
});
