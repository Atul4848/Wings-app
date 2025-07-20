import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { FlightPlanFormatDocumentModel } from '../../Shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { FlightPlanDocumentGrid } from '../Component';
import { AgGridTestingHelper, useRouterContext } from '@wings/shared';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { GRID_ACTIONS } from '@wings-shared/core';
import { CollapsibleWithButton } from '@wings-shared/layout';

describe('FlightPlanDocumentGrid module', () => {
  let wrapper: ReactWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    isEditable: true,
    flightPlanFormatDocuments: [new FlightPlanFormatDocumentModel()],
    onDataSave: sinon.fake(),
    onRowEditing: sinon.spy(),
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <FlightPlanDocumentGrid {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
    agGridHelper = new AgGridTestingHelper(wrapper);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, render CustomAgGridReacts', () => {
    expect(wrapper).to.be.ok;
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    const props = agGridHelper.getAgGridProps();
    expect(props.isRowEditing).false;
  });

  it('should work with different agGrid Actions', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
    
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 1);
    props.onRowEditing(false);
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    parentComp.onInputChange({ colDef: { field: 'name' } } as any, '');
  });

  it('should call cancel function', () => {
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 1);
    agGridHelper.getAgGridProps();
  });

  it('should add the new type on add button click', () => {
    wrapper
      .find(CollapsibleWithButton)
      .props()
      .onButtonClick();
  });
});
