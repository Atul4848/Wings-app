import { GRID_ACTIONS, SettingsTypeModel } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';
import { Logger } from '@wings-shared/security';
import { expect } from 'chai';
import { ShallowWrapper, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { AIRPORT_CODE_TYPES, AirportSettingsStoreMock } from '../../Shared';
import { AirportCode } from '../Components';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { FormControlLabel } from '@material-ui/core';

describe('AirportCode Settings', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    codeType: AIRPORT_CODE_TYPES.REGIONAL_CODE,
    headerName: 'Regional Code',
    codeLength: 4,
    airportSettingsStore: new AirportSettingsStoreMock(),
    upsertSettings: sinon.fake(),
  };

  beforeEach(() => {
    sinon.stub(Logger, 'warning');
    wrapper = shallow(<AirportCode {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors, should render CustomAgGridReact and SearchHeader ', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
    expect(agGridHelper.getGridOptions().columnDefs?.length).to.eq(7);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should start row editing if row index is given', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).true;
  });

  it('should stop row editing on Cancel click', () => {
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call upsert function on save button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(props.upsertSettings.called).true;
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onInputChange');
    parentComp.onInputChange({ colDef: { field: 'code' } } as any, 'TST');
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

  it('should format values correctly in column definitions', () => {
    const value = '2022-09-14T23:35:22.9733333';
    const mockData = {
      value: { name: 'Mock Name', label: 'Mock Label' },
    };
    const fieldsToCheck = ['modifiedOn', 'createdOn'];
    agGridHelper.validateColumnFormatting(fieldsToCheck, value);
    agGridHelper.validateColumnFormatting(['status'], mockData);
  });

  it('should compare values correctly in column definitions', () => {
    const mockStatus1 = new SettingsTypeModel({ id: 1, name: 'Active' });
    const mockStatus2 = new SettingsTypeModel({ id: 2, name: 'InActive' });
    agGridHelper.compareColumnValues(['status'], mockStatus1, mockStatus2);
  });
});
