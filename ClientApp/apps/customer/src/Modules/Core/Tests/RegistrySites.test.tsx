import { AgGridTestingHelper, useRouterContext } from '@wings/shared';
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import { CustomerStoreMock, RegistrySites, RegistryStoreMock } from '../../Shared';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import sinon from 'sinon';
import { GRID_ACTIONS } from '@wings-shared/core';
import { DetailsEditorHeaderSection } from '@wings-shared/layout';

describe('RegistrySites', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    registryStore: new RegistryStoreMock(),
    customerStore: new CustomerStoreMock(),
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <RegistrySites {...props} />
    </ThemeProvider>
  );

  const reRender = () => wrapper.setProps({ abc: Math.random() });

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    parentComp.onInputChange({ colDef: { field: 'startDate' } } as any, '');
    parentComp.onInputChange({ colDef: { field: 'startDate' } } as any, '1996-03-16T00:00:00');
    parentComp.onInputChange({ colDef: { field: 'endDate' } } as any, '');
    parentComp.onInputChange({ colDef: { field: 'endDate' } } as any, '1999-03-06T00:00:00');
  });

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'abc' } } as any, null);
    parentComp.onDropDownChange({ colDef: { field: 'site' } } as any, 'abc');
    parentComp.onDropDownChange({ colDef: { field: 'site' } } as any, { name: 'abc', id: 1 });
    expect(mock.callCount).equal(3);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    const props = agGridHelper.getAgGridProps();
    expect(props.isRowEditing).false;
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

  it('should adjust the date', () => {
    agGridHelper.onAction(GRID_ACTIONS.ADJUST_DATE, 0);
  });

  it('should call upsert function on save button click', () => {
    const mock = sinon.spy(props.customerStore, 'upsertAssociatedRegistrySite');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    reRender();
    expect(mock.calledOnce).true;
  });

  it('should start and stop header actions', () => {
    wrapper
      .find(DetailsEditorHeaderSection)
      .props()
      .onAction(GRID_ACTIONS.EDIT);
    // on cancel action
    wrapper
      .find(DetailsEditorHeaderSection)
      .props()
      .onAction(GRID_ACTIONS.CANCEL);
  });
});
