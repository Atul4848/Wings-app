import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { AirportSettingsStoreMock } from '../../Shared';
import { ConditionalOperator } from '../Components';
import sinon from 'sinon';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { PrimaryButton } from '@uvgo-shared/buttons';

describe('Conditional Operator Setting Module', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;
  const reRender = () => wrapper.setProps({ abc: Math.random() });

  const props = {
    airportSettingsStore: new AirportSettingsStoreMock(),
    editable: true,
  };

  beforeEach(() => {
    wrapper = shallow(<ConditionalOperator {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
    sinon.stub(SettingsModuleSecurity, 'isEditable').value(true);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, should render CustomAgGridReact and SearchHeader ', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
    expect(agGridHelper.getGridOptions().columnDefs).to.have.length(2);
  });

  it('should stop row editing on Cancel click', () => {
    // row index is null then do nothing
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;

    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call upsert function on save button click', () => {
    const mock = sinon.spy(props.airportSettingsStore, 'upsertConditionalOperator');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onInputChange');
    parentComp.onInputChange({ colDef: { field: 'operator' } } as any, 'Test');
    expect(mock.calledOnce).to.be.true;
  });

  it('should not render Add Conditional Operator button if edit permission is not provided', () => {
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
