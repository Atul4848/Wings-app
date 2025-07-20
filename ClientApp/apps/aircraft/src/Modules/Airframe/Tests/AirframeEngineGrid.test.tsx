import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
import { AgGridMasterDetails, CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { EngineSerialNumberModel } from '../../Shared';
import sinon from 'sinon';
import AirframeEngineGrid from '../Components/AirframeEditor/AirframeEngineGrid';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Airframe Engine Grid', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;
  const reRender = () => wrapper.setProps({ abc: Math.random() });

  const props = {
    isEditable: false,
    onDataSave: () => {},
    isEngineDetailsExist: false,
  };

  beforeEach(function() {
    wrapper = shallow(<AirframeEngineGrid {...props} />);
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(function() {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors, render AgGridMasterDetails', function() {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(AgGridMasterDetails)).to.have.length(1);
  });

  it('should not start row editing if row index is null', function() {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should start and stop row editing', function() {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).true;

    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should add 4 columns in the table', () => {
    expect(wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs).to.have.length(4);
  });

  it('should format values correctly in column definitions', () => {
    const columnFields = ['temporaryEngineDate'];
    const mockData = {
      value: { name: 'Mock Name', label: 'Mock Label' },
    };
    agGridHelper.validateColumnFormatting(columnFields, mockData);
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onInputChange');
    parentComp.onInputChange({ colDef: { field: 'serialNumber' } } as any, '');
    parentComp.onInputChange({ colDef: { field: 'isTemporaryEngine' } } as any, '');
    expect(mock.callCount).equal(2);
  });

  it('should call onDataSave when upsertEngine is triggered', () => {
    const onDataSaveSpy = sinon.spy(props, 'onDataSave');
    wrapper.setProps({ isEditable: true, onDataSave: onDataSaveSpy });

    agGridHelper.onAction(GRID_ACTIONS.SAVE, 0);
    reRender();

    expect(onDataSaveSpy.calledOnce).to.be.true;
  });
});
