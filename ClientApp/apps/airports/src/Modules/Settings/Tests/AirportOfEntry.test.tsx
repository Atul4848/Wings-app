import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { AirportOfEntry } from '../Components';
import { AirportSettingsStoreMock } from '../../Shared';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import sinon from 'sinon';

describe('Airport Of Entry Setting Module', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;
  const reRender = () => wrapper.setProps({ abc: Math.random() });

  const props = {
    airportSettingsStore: new AirportSettingsStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<AirportOfEntry {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, should render CustomAgGridReact and SearchHeader ', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
    expect(agGridHelper.getGridOptions().columnDefs).to.have.length(3);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should stop row editing on Cancel click', () => {
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should call upsert function on save button click', () => {
    const upsertAirportOfEntry = sinon.spy(props.airportSettingsStore, 'upsertAirportOfEntry');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(upsertAirportOfEntry.calledOnce).true;
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onInputChange');
    parentComp.onInputChange({ colDef: { field: 'name' } } as any, 'Test');
    expect(mock.calledOnce).to.be.true;
  });
});
