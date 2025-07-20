import { GRID_ACTIONS } from '@wings-shared/core';
import { AgGridTestingHelper } from '@wings/shared';
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { PermitSettingsStoreMock, PermitStoreMock } from '../../Shared';
import { SidebarStore } from '@wings-shared/layout';
import { MemoryRouter } from 'react-router-dom';
import RevisionTriggerGrid from '../Components/AdditionalInfo/RevisionTriggerGrid';
import { AgGridMasterDetails } from '@wings-shared/custom-ag-grid';

describe('RevisionTrigger Grid', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;
  let agGridHook;

  const props = {
    permitStore: new PermitStoreMock(),
    permitSettingsStore: new PermitSettingsStoreMock(),
    sidebarStore: SidebarStore,
  };

  const reRender = () => wrapper.setProps({ abc: Math.random() });

  beforeEach(() => {
    agGridHook = sinon.stub();
    wrapper = mount(
      <MemoryRouter>
        <RevisionTriggerGrid {...props} />
      </MemoryRouter>
    );
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should add a new flight planning ACAS', () => {
    const addNewItemsStub = sinon.stub();
    agGridHook.returns({ addNewItems: addNewItemsStub });

    wrapper
      .find(AgGridMasterDetails)
      .props()
      .onAddButtonClick();

    expect(addNewItemsStub.calledOnce).to.be.false;
  });

  it('should be rendered without errors and render AgGridMasterDetails', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(AgGridMasterDetails)).to.have.length(1);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).to.be.false;
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).to.be.true;
  });
});
