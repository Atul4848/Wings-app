import React from 'react';
import { shallow, ShallowWrapper } from "enzyme";
import { GridApiMock } from '@wings/shared';
import { FuelModel, FuelStoreMock } from "../../Shared";
import Fuel from "../Fuel";
import { PrimaryButton } from '@uvgo-shared/buttons';
import { expect } from "chai";
import sinon from "sinon";
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ConfirmDialog } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Fuel', () => {
  let wrapper: ShallowWrapper;
  let instance;

  const props = {
    classes: {},
    fuelStore: new FuelStoreMock(),
  }

  beforeEach(() => {
    wrapper = shallow(<Fuel {...props} />).dive().dive();
    instance = wrapper.instance();
    instance.gridApi = new GridApiMock({ data: new FuelModel() });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('add button should open upsert dialog', () => {
    const openFuelDialogSpy = sinon.spy(instance, 'openFuelDialog')
    wrapper.find(PrimaryButton).simulate('Click')
    expect(openFuelDialogSpy.called).to.be.true
  });

  it('Grid action should return if row index is null', () => {
    const editCaller = sinon.spy();
    instance.gridActions(null, null);
    expect(editCaller.calledOnce).to.be.false;
  });

  it('Grid action EDIT should open upsert dialog', () => {
    const openFuelDialogSpy = sinon.spy(instance, 'openFuelDialog')
    instance.gridActions(GRID_ACTIONS.EDIT, 1);
    expect(openFuelDialogSpy.called).to.be.true;
  });

  it('GRID Action DELETE should render ConfirmDialog', () => {
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    expect(modalData.find(ConfirmDialog)).to.have.length(1);

    // on Yes click in dialog should delete Fuel
    const deleteFuelSpy = sinon.spy(instance, 'deleteFuel')
    modalData.find(ConfirmDialog).simulate('YesClick')
    expect(deleteFuelSpy.called).to.be.true;

    // on No click should close dialog
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    modalData.find(ConfirmDialog).simulate('NoClick')
    expect(closeSpy.called).to.be.true;
  });
});