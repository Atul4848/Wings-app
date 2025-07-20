import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { GRID_ACTIONS } from '@wings-shared/core';
import { AirportSettingsStoreMock } from '../../Shared';
import sinon from 'sinon';
import { ICAOCode } from '../Components';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { FormControlLabel } from '@material-ui/core';

describe('ICAOCode Setting Module', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    airportSettingsStore: new AirportSettingsStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<ICAOCode {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
    ModalStore.data = null;
  });

  it('should be rendered without errors, should render CustomAgGridReact and SearchHeader ', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
    expect(agGridHelper.getGridOptions().columnDefs?.length).to.eq(7);
  });

  it('should stop row editing on Cancel click', () => {
    // row index is null then do nothing
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;

    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call upsert function on save button click', () => {
    const mock = sinon.spy(props.airportSettingsStore, 'upsertICAOCode');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });

  it('should show AuditHistory', () => {
    agGridHelper.onAction(GRID_ACTIONS.AUDIT, 1);
    const auditHistory = shallow(<div>{ModalStore.data}</div>);
    expect(auditHistory).to.have.length(1);
  });

  it('should call onInputChange', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onInputChange');
    parentComp.onInputChange(
      {
        colDef: { field: 'code' },
      } as any,
      'TST'
    );
    parentComp.onInputChange(
      {
        colDef: { field: 'code' },
      } as any,
      'KHOU'
    );
    expect(mock.callCount).equal(2);
  });

  it('should not render rightContent', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    const formControl = searchHeader
      .dive()
      .dive()
      .find(FormControlLabel);
    searchHeader.props().rightContent();
    const formControlLabel = index => formControl.at(index).props().control.props;
    formControlLabel(0).onChange('', true);
    formControlLabel(1).onChange('', false);
    wrapper.update();
    expect(formControl.length).to.eq(2);
  });

  it('should  load ICAOCodes when onFilterChange is called', () => {
    const mock = sinon.spy(props.airportSettingsStore, 'loadICAOCodes');
    wrapper
      .find(SearchHeaderV3)
      .props()
      .onFiltersChanged();
    expect(mock.calledOnce).true;
  });
});
