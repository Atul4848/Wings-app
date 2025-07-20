import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { PureAirportHoursDetails } from '../Components/AirportHoursDetails/AirportHoursDetails';
import { AirportHoursModel, AirportHoursStoreMock, AirportStoreMock } from '../../Shared';
import { CommonAirportHoursGrid } from '../../AirportHours';
import { IGridApi, AuditHistory, GridApiMock } from '@wings/shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Airport Hours Details Component', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let gridApi: IGridApi;
  const airportHourData = new AirportHoursModel({
    id: 1,
    name: 'TEST',
    icao: '',
  });

  const props = {
    classes: {},
    airportHoursStore: new AirportHoursStoreMock(),
    airportStore: new AirportStoreMock(),
    params: { airportId: 1, icao: 'KHOU' },
  };

  beforeEach(() => {
    wrapper = shallow(<PureAirportHoursDetails {...props} />).dive();
    instance = wrapper.instance();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CommonAirportHoursGrid)).to.have.length(1);
  });

  it('should call onPaginationChange', () => {
    const loadAirportHoursSpy = sinon.spy(instance, 'loadAirportHours');
    wrapper.find(CommonAirportHoursGrid).simulate('paginationChange');
    expect(loadAirportHoursSpy.called).to.be.true;
  });

  it('should call onAction', () => {
    const gridActionsSpy = sinon.spy(instance, 'gridActions');
    wrapper.find(CommonAirportHoursGrid).simulate('action');
    expect(gridActionsSpy.called).to.be.true;
  });

  it('should open AuditHistory on Grid action AUDIT', () => {
    gridApi = new GridApiMock({ data: airportHourData });
    instance.gridApi = gridApi;

    instance.gridActions(GRID_ACTIONS.AUDIT, 1);
    const auditHistory = shallow(ModalStore.data);
    expect(auditHistory).to.have.length(1);

    // else case
    instance.gridActions(GRID_ACTIONS.EDIT, null);
    expect(wrapper.find(AuditHistory)).to.have.length(0);
  });
});
