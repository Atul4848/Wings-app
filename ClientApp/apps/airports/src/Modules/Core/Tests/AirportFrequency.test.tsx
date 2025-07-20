import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { ColumnApiMock, GridApiMock, VIEW_MODE } from '@wings/shared';
import { GRID_ACTIONS, SettingsTypeModel } from '@wings-shared/core';
import { ModalKeeper, ModalStore } from '@uvgo-shared/modal-keeper';
import { PureAirportFrequency } from '../Components/AirportFrequency/AirportFrequency';
import { AirportFrequencyModel, AirportSettingsStoreMock, AirportStoreMock } from '../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SidebarStore } from '@wings-shared/layout';

describe('Airport Frequency Component', function () {
  let wrapper: ShallowWrapper;
  let instance: any;
  let gridApi: GridApiMock;

  const props = {
    classes: {},
    isEditable: false,
    navigate: sinon.spy(),
    sidebarStore: SidebarStore,
    airportSettingsStore: new AirportSettingsStoreMock(),
    airportStore: new AirportStoreMock(),
    params: { airportId: '1', viewMode: VIEW_MODE.EDIT },
  };

  beforeEach(function () {
    const shallowWrapper = shallow(
      <div>
        <PureAirportFrequency {...props} />
        <ModalKeeper />
      </div>
    );
    wrapper = shallowWrapper.find(PureAirportFrequency).shallow().dive();
    instance = wrapper.instance();
    instance.columnApi = { setColumnVisible: sinon.fake() };
    gridApi = new GridApiMock();
    instance.gridApi = gridApi;
    instance.columnApi = new ColumnApiMock();
  });

  afterEach(function () {
    wrapper.unmount();
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.have.length(1);
  });

  it('should call addAirportFrequency of PrimaryButton', function () {
    const onAddAirportFrequencySpy = sinon.spy(instance, 'addAirportFrequency');
    wrapper.find(PrimaryButton).simulate('click');
    expect(onAddAirportFrequencySpy.calledOnce).to.be.true;
  });

  it('onInputChange should set hasError value based on changes', function () {
    instance.gridApi = new GridApiMock({ hasError: true });
    instance.onInputChange({ colDef: { field: 'frequency', data: 'TEST' } });
    expect(instance.hasError).to.be.true;
  });

  it('onDropDownChange should set hasError value based on changes', function () {
    instance.gridApi = new GridApiMock({ hasError: false });
    instance.onDropDownChange({ colDef: { field: 'frequencyType', data: new SettingsTypeModel() } });
    expect(instance.hasError).to.be.false;
  });

  it('GRID Action DELETE should render ConfirmDialog', function () {
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    const modalData = shallow(ModalStore.data);
    expect(modalData.find('ConfirmDialog')).to.have.length(1);
  });

  it('Grid actions should work properly', function () {
    // No editing if no rowIndex provided
    expect(instance.gridActions(null, null)).to.equal(undefined);
    expect(gridApi.startEditingCell.called).to.be.false;
    // EDIT case
    instance.gridActions(GRID_ACTIONS.EDIT, 1);
    expect(gridApi.startEditingCell.called).to.be.true;
    // CANCEL case
    const _cancelEditingSpy = sinon.spy(instance, '_cancelEditing');
    instance.gridActions(GRID_ACTIONS.CANCEL, 1);
    expect(_cancelEditingSpy.calledWith(1)).to.be.true;
    // default case
    instance.gridActions(null, 1);
    expect(_cancelEditingSpy.calledWith(1)).to.be.true;
  });

  it('Grid action SAVE should call API and update rows', function () {
    gridApi = new GridApiMock({ data: new AirportFrequencyModel() });
    instance.gridApi = gridApi;
    instance.gridActions(GRID_ACTIONS.SAVE, 1);
    expect(gridApi.setData.calledOnce).to.be.true;
  });
});
