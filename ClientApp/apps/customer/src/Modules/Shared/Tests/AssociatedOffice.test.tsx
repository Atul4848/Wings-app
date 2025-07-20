import { GRID_ACTIONS } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';
import { Logger } from '@wings-shared/security';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { AssociatedOffice, CustomerStoreMock, RegistryStoreMock, SettingsStoreMock } from '../../Shared';
import { SearchHeaderV3 } from '@wings-shared/form-controls';

describe('AssociatedOffice', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    title: 'Office',
    backNavTitle: '',
    backNavLink: '/office',
    settingsStore: new SettingsStoreMock(),
    customerStore: new CustomerStoreMock(),
    registryStore: new RegistryStoreMock(),
  };

  beforeEach(() => {
    sinon.stub(Logger, 'warning');
    wrapper = shallow(<AssociatedOffice {...props} />).dive();
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
    expect(propsV1.isRowEditing).true;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    const propsV2 = agGridHelper.getAgGridProps();
    expect(propsV2.isRowEditing).false;
  });

  it('should call upsert function on save button click', () => {
    const mock = sinon.spy(props.customerStore, 'upsertAssociatedOffice');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'abc' } } as any, null);
    parentComp.onDropDownChange({ colDef: { field: 'name' } } as any, 'abc');
    parentComp.onDropDownChange({ colDef: { field: 'status' } } as any, { id: 1, name: 'Active' });
    parentComp.onDropDownChange({ colDef: { field: 'status' } } as any, { id: 2, name: 'InActive' });
    expect(mock.callCount).equal(4);
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    parentComp.onInputChange({ colDef: { field: 'startDate' } } as any, '');
    parentComp.onInputChange({ colDef: { field: 'endDate' } } as any, '');
  });

  it('should change the values with onFilterChange function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .onFiltersChanged();
  });

  it('should render the react node with rightContent function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .rightContent();
  });
});
