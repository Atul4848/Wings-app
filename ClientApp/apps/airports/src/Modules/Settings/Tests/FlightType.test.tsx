import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import * as sinon from 'sinon';
import { FlightType } from '../Components';
import { AirportSettingsStoreMock } from '../../Shared';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import { ICellEditorParams } from 'ag-grid-community';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { PrimaryButton } from '@uvgo-shared/buttons';

describe('FlightType Settings Module', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    airportSettingsStore: new AirportSettingsStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<FlightType {...props} />).dive();
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
    expect(agGridHelper.getGridOptions().columnDefs).to.have.lengthOf(2);
  });

  it('should start and stop row editing', () => {
    // if rowIndex is null
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;

    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call upsert function on save button click', () => {
    const upsertFlightTypeSpy = sinon.spy(props.airportSettingsStore, 'upsertFlightType');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(upsertFlightTypeSpy.calledOnce).true;
  });

  it('should call onInputChange function', () => {
    const onInputChangeSpy = sinon.spy(agGridHelper.getParentComponent(), 'onInputChange');
    agGridHelper.getParentComponent().onInputChange({ colDef: { field: 'code' } } as ICellEditorParams, 'Test');
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
