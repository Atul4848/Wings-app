import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import * as sinon from 'sinon';
import { ConditionTypeConfig } from '../Components';
import { AirportSettingsStoreMock } from '../../Shared';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import { ICellEditorParams } from 'ag-grid-community';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { PrimaryButton } from '@uvgo-shared/buttons';

describe('ConditionTypeConfig Settings Module', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    airportSettingsStore: new AirportSettingsStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<ConditionTypeConfig {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
    sinon.stub(SettingsModuleSecurity, 'isEditable').value(true);
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors, should render CustomAgGridReact and SearchHeader ', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
    expect(agGridHelper.getGridOptions().columnDefs).to.have.lengthOf(5);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).true;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call upsert function on save button click', () => {
    const mock = sinon.spy(props.airportSettingsStore, 'upsertConditionTypeConfig');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });

  it('should call onInputChange function', () => {
    const onInputChangeSpy = sinon.spy(agGridHelper.getParentComponent(), 'onInputChange');
    agGridHelper.getParentComponent().onInputChange({ colDef: { field: 'apiSource' } } as ICellEditorParams, 'Test');
    expect(onInputChangeSpy.calledOnce).to.be.true;
  });

  it('should not render Add button if edit permission is not provided', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .rightContent();
    sinon.stub(SettingsModuleSecurity, 'isEditable').value(false);
    const addButton = wrapper
      .find(SearchHeaderV3)
      .dive()
      .dive()
      .find(PrimaryButton)
      .at(0);
    expect(addButton).to.have.length(0);
  });
});
