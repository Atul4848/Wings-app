import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow, ShallowWrapper } from 'enzyme';
import { AirportSettingsStoreMock, AirportStoreMock } from '../../Shared/Mocks';
import { VIEW_MODE } from '@wings/shared';
import { PureFlightPlanInformation } from '../Components/FlightPlanInformation/FlightPlanInformation';
import { AirportFlightPlanInfoModel, AirportModel } from '../../Shared';
import { DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Flight Plan Information Module', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let headerActions: ShallowWrapper;
  const airportStore = new AirportStoreMock();
  const airportSettingsStore = new AirportSettingsStoreMock();
  const selectedAirport = new AirportModel({
    airportFlightPlanInfo: new AirportFlightPlanInfoModel({ navBlueCode: 'ABC' }),
  });

  const props = {
    classes: {},
    airportStore,
    airportSettingsStore,
    viewMode: VIEW_MODE.NEW,
    params: { airportId: '1', viewMode: VIEW_MODE.NEW },
    navigate: sinon.fake(),
    basePath: 'xyz',
  };

  beforeEach(() => {
    props.airportStore.selectedAirport = selectedAirport;
    wrapper = shallow(<PureFlightPlanInformation {...props} />).dive();
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('headerActions should call action from DetailsEditorHeaderSection actions', () => {
    const onActionSpy = sinon.spy(instance, 'onAction');
    headerActions.find(DetailsEditorHeaderSection).simulate('action', GRID_ACTIONS.CANCEL);
    expect(onActionSpy.calledWith(GRID_ACTIONS.CANCEL)).true;
  });

  it('should return proper field by calling fieldProp', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
    const field = viewInputControlsGroup.prop('field')('navBlueCode');
    const onValueChangeSpy = sinon.spy(instance, 'onValueChange');

    // should return proper field
    expect(field.label).to.eq('NavBlue Code');

    // should call onValueChange
    viewInputControlsGroup.simulate('valueChange', 'TEST', 'navBlueCode');
    expect(onValueChangeSpy.calledWith('TEST', 'navBlueCode')).true;
  });

  it('onAction should call upsertAirportFlightPlanInfo on SAVE action', () => {
    const upsertAirportFlightPlanInfoSpy = sinon.spy(instance, 'upsertAirportFlightPlanInfo');
    instance.onAction(GRID_ACTIONS.SAVE);
    expect(upsertAirportFlightPlanInfoSpy.called).true;
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
});
