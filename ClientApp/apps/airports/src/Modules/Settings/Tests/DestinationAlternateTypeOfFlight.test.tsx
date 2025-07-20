import { GRID_ACTIONS } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { AirportSettingsStoreMock } from '../../Shared';
import { DestinationAlternateTypeOfFlight } from '../Components';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';

describe('Destination Alternate Type Of Flight', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    airportSettingsStore: new AirportSettingsStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<DestinationAlternateTypeOfFlight {...props} />).dive();
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
    expect(agGridHelper.getGridOptions().columnDefs).to.have.lengthOf(3);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).to.be.true;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call upsert function on save button click', () => {
    const upsertSpy = sinon.spy(props.airportSettingsStore, 'upsertDestinationAlternateTOF');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(upsertSpy.called).true;
  });

  it('should call upsert function on delete button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.DELETE, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const onInputChangeSpy = sinon.spy(parentComp, 'onInputChange');
    parentComp.onInputChange({ colDef: { field: 'name' } } as any, 'Name1');
    parentComp.onInputChange({ colDef: { field: 'code' } } as any, 'Code1');
    expect(onInputChangeSpy.callCount).to.be.eq(2);
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
