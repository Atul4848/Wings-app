import { GRID_ACTIONS } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {
  AirportFrequencyModel,
  AirportRunwayModel,
  AirportStoreMock,
  AssociatedRunwayModel,
  RunwayDetailModel,
} from '../../Shared';
import { AssociatedRunways } from '../../Core/Components';
import { ModalStore } from '@uvgo-shared/modal-keeper';

describe('Associated Runways', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    data: [new AssociatedRunwayModel()],
    airportStore: new AirportStoreMock(),
    isParentRowEditing: () => false,
    onChildRowEditing: () => false,
    onRunwayUpdate: (index: number, frequency: AirportFrequencyModel) => null,
    isEditable: true,
    isMasterDetails: false
  };

  const reRender = () => wrapper.setProps({ abc: Math.random() });

  beforeEach(() => {
    wrapper = mount(<AssociatedRunways {...props} />);
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors, should render CustomAgGridReact and AgGridMasterDetails ', () => {
    expect(wrapper).to.have.length(1);
    expect(agGridHelper.getAgGridComponent()).to.have.length(1);
    expect(agGridHelper.getGridOptions().columnDefs?.length).to.eq(3);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
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

  it('should call upsert function on save button click', () => {
    const upsertAssociatedRunway = sinon.spy(props.airportStore, 'upsertAssociatedRunway');
    agGridHelper.onAction(GRID_ACTIONS.SAVE, 1);
    expect(upsertAssociatedRunway.calledOnce).true;
  });

  it('should open confirmation dialog on delete button click', () => {
    const openSpy = sinon.fake();
    ModalStore.open = openSpy;
    agGridHelper.onAction(GRID_ACTIONS.DELETE, 1);
    expect(openSpy.calledOnce).to.be.true;
  });

  it('should change the values with onDropDownChange function', () => {
    const runwayDetail = new RunwayDetailModel({ runwayId: 1 });
    const runway = new AirportRunwayModel({ airportId: 1, runwayId: 'Test' });
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'runway' } } as any, runway);
    parentComp.onDropDownChange({ colDef: { field: 'runwayDetail' } } as any, runwayDetail);
    expect(mock.callCount).equal(2);
  });
});
