import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow, ShallowWrapper } from 'enzyme';
import { VIEW_MODE,} from '@wings/shared';
import { AirportStoreMock } from '../../Shared/Mocks';
import { PureOwnership } from '../Components/Ownership/Ownership';
import { AirportManagementModel, AirportModel } from '../../Shared';
import { DetailsEditorWrapper } from '@wings-shared/layout';
import { SEARCH_ENTITY_TYPE, GRID_ACTIONS } from '@wings-shared/core';

describe('Ownership Module', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let headerActions: ShallowWrapper;
  const airportStore = new AirportStoreMock();
  const selectedAirport = new AirportModel({
    airportManagement: new AirportManagementModel({ airportManagerName: 'TEST' }),
  });

  const props = {
    classes: {},
    airportStore,
    viewMode: VIEW_MODE.NEW,
    params: { airportId: '1', viewMode: VIEW_MODE.NEW },
    navigate: sinon.fake(),
    locationFields: ['airportLocation.city', 'airportLocation.country', 'airportLocation.island'],
    basePath: 'xyz',
  };

  beforeEach(() => {
    props.airportStore.selectedAirport = selectedAirport;
    wrapper = shallow(<PureOwnership {...props} />).dive();
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('onSearch should search Countries if entityType is COUNTRY', () => {
    const getCountriesSpy = sinon.spy(instance.airportStore, 'getCountries');
    instance.onSearch('TEST', '', SEARCH_ENTITY_TYPE.COUNTRY);
    expect(getCountriesSpy.called).true;

    // when searchValue is null
    instance.onSearch(null, '', SEARCH_ENTITY_TYPE.COUNTRY);
    expect(instance.airportStore.countries).to.be.empty;
  });

  it('onSearch should load cities if entityType is CITY', () => {
    const loadCitiesSpy = sinon.spy(instance, 'loadCities');
    instance.onSearch('TEST', 'airportManagerAddress.city', SEARCH_ENTITY_TYPE.CITY);
    expect(loadCitiesSpy.called).to.be.true;
  });
  
  it('onAction should call upsertAirports on SAVE action', () => {
    const upsertAirportManagementSpy = sinon.spy(instance, 'upsertAirportManagement');
    instance.onAction(GRID_ACTIONS.SAVE);
    expect(upsertAirportManagementSpy.called).true;
  });

  it('onAction should call setViewMode on EDIT action', () => {
    const setViewModeSpy = sinon.spy(instance, 'setViewMode');
    instance.onAction(GRID_ACTIONS.EDIT);
    expect(setViewModeSpy.called).true;
  });

  it('onAction should call navigate if params are null on CANCEL action', () => {
    wrapper.setProps({ ...props, params: {} });
    instance.onAction(GRID_ACTIONS.CANCEL);
    expect(props.navigate.called).true;
  });

  it('onAction should call setFormValues if viewMode is DETAILS on CANCEL action', () => {
    const setFormValuesSpy = sinon.spy(instance, 'setFormValues');
    wrapper.setProps({ ...props, params: { viewMode: VIEW_MODE.DETAILS } });
    instance.onAction(GRID_ACTIONS.CANCEL);
    expect(setFormValuesSpy.called).true;
  });

  it('onValueChange should load Airpoort Manager Address if entityType is COUNTRY', () => {
    const loadStatesSpy = sinon.spy(instance, 'loadStates');
    instance.onValueChange('TEST', 'airportManagerAddress.country');
    expect(loadStatesSpy.calledWith('airportManagerAddress.country')).true;
  });

  it('onValueChange should load Airpoort Owner Address if entityType is COUNTRY', () => {
    const loadStatesSpy = sinon.spy(instance, 'loadStates');
    instance.onValueChange('TEST', 'airportOwnerAddress.country');
    expect(loadStatesSpy.calledWith('airportOwnerAddress.country')).true;
  });

  it('onValueChange should load Airpoort Manager Address if entityType is STATE', () => {
    instance.onValueChange('TEST', 'airportManagerAddress.state');
  });

  it('onValueChange should load Airpoort Owner Address if entityType is STATE', () => {
    instance.onValueChange('TEST', 'airportOwnerAddress.state');
  });

});
