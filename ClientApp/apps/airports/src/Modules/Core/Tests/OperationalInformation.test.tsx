import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow, ShallowWrapper } from 'enzyme';
import { VIEW_MODE } from '@wings/shared';
import { AirportStoreMock, AirportSettingsStoreMock } from '../../Shared/Mocks';
import { PureOperationalInformation } from '../Components/OperationalInformation/OperationalInformation';
import { AirportModel, AirportOperationalInfoModel } from '../../Shared';
import { DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';

describe('Operational Information Module', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let headerActions: ShallowWrapper;
  const airportStore = new AirportStoreMock();
  const airportSettingsStore = new AirportSettingsStoreMock();
  const selectedAirport = new AirportModel({
    airportOperationalInfo: new AirportOperationalInfoModel({ isGAFriendly: true }),
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
    wrapper = shallow(<PureOperationalInformation {...props} />).dive();
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
    const field = viewInputControlsGroup.prop('field')('isGAFriendly');
    const onValueChangeSpy = sinon.spy(instance, 'onValueChange');
    const onSearchSpy = sinon.spy(instance, 'onSearch');
    const onFocusSpy = sinon.spy(instance, 'onFocus');

    // should return proper field
    expect(field.label).to.eq('GA Friendly');

    // should call onValueChange
    viewInputControlsGroup.simulate('valueChange', true, 'isGAFriendly');
    expect(onValueChangeSpy.calledWith(true, 'isGAFriendly')).true;

    // should call onSearch
    viewInputControlsGroup.simulate('search', 'TEST', 'jurisdiction');
    expect(onSearchSpy.calledWith('TEST', 'jurisdiction')).true;

    // if case
    viewInputControlsGroup.simulate('search', null, 'jurisdiction');
    expect(instance.airportStore.countries).to.be.empty;

    // should call onFocus
    viewInputControlsGroup.simulate('focus', 'airportCategory');
    expect(onFocusSpy.calledWith('airportCategory')).true;
  });

  it('onAction should call upsertAirportOperationalInfo on SAVE action', () => {
    const upsertAirportOperationalInfoSpy = sinon.spy(instance, 'upsertAirportOperationalInfo');
    instance.onAction(GRID_ACTIONS.SAVE);
    expect(upsertAirportOperationalInfoSpy.called).true;
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

  it('onValueChange called with fieldKeys isForeignBasedEntity', () => {
    const field = wrapper.find(ViewInputControlsGroup).prop('field')('jurisdiction');
    instance.onValueChange(false, 'isForeignBasedEntity');
    expect(field.value).to.eq(undefined);
  });

  it('should call onFocus with Focus key weatherReportingSystem', () => {
    const loadWeatherReportingSystemSpy = sinon.spy(instance.airportSettingsStore, 'loadWeatherReportingSystem');
    instance.onFocus('weatherReportingSystem');
    expect(loadWeatherReportingSystemSpy.called).true;
  });

  it('should call onFocus with Focus key classCode', () => {
    const loadClassCodeSpy = sinon.spy(instance.airportSettingsStore, 'loadClassCode');
    instance.onFocus('classCode');
    expect(loadClassCodeSpy.called).true;
  });

  it('should call onFocus with Focus key certificateCode', () => {
    const loadCertificateCodeSpy = sinon.spy(instance.airportSettingsStore, 'loadCertificateCode');
    instance.onFocus('certificateCode');
    expect(loadCertificateCodeSpy.called).true;
  });

  it('should call onFocus with Focus key serviceCode', () => {
    const loadServiceCodeSpy = sinon.spy(instance.airportSettingsStore, 'loadServiceCode');
    instance.onFocus('serviceCode');
    expect(loadServiceCodeSpy.called).true;
  });

  it('onSearch should load metros if fieldKey is metro', () => {
    const getMetrosSpy = sinon.spy(instance.airportStore, 'getMetros');
    instance.onSearch('TEST', 'metro');
    expect(getMetrosSpy.called).true;
  });
});
