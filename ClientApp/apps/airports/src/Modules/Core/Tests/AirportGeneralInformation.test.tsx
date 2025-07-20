import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { VIEW_MODE, CityModel } from '@wings/shared';
import { AirportStoreMock, AirportSettingsStoreMock } from '../../Shared/Mocks';
import { PureAirportGeneralInformation } from '../Components/AirportGeneralInformation/AirportGeneralInformation';
import sinon from 'sinon';
import { Field } from 'mobx-react-form';
import { AirportLocationModel, AirportModel } from '../../Shared';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { AuditFields, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { SEARCH_ENTITY_TYPE, EntityMapModel, GRID_ACTIONS } from '@wings-shared/core';

describe('AirportGeneralInformation Module', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let headerActions: ShallowWrapper;
  const airportStore = new AirportStoreMock();
  const airportSettingsStore = new AirportSettingsStoreMock();

  const props = {
    classes: {},
    airportStore,
    airportSettingsStore,
    viewMode: VIEW_MODE.NEW,
    params: { airportId: '1', viewMode: VIEW_MODE.NEW },
    navigate: sinon.fake(),
    locationFields: ['airportLocation.city', 'airportLocation.closestCity', 'airportLocation.island'],
    basePath: 'xyz',
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<PureAirportGeneralInformation {...props} />).dive();
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
    instance = wrapper.instance();
    instance.getField('appliedAirportUsageType').set([ new EntityMapModel({ name: 'Retail', entityId: 1 }) ]);
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
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
    const field = viewInputControlsGroup.prop('field')('icaoCode');
    const onValueChangeSpy = sinon.spy(instance, 'onValueChange');
    const onFocusSpy = sinon.spy(instance, 'onFocus');

    // should return proper field
    expect(field.label).to.eq('ICAO Code');

    // should call onValueChange
    viewInputControlsGroup.simulate('valueChange', 'TEST', 'icaoCode');
    expect(onValueChangeSpy.calledWith('TEST', 'icaoCode')).true;

    // should call onFocus
    viewInputControlsGroup.simulate('focus', 'island');
    expect(onFocusSpy.calledWith('island')).true;
  });

  it('should get proper field with AuditFields', () => {
    const field: Field = wrapper.find(AuditFields).prop('onGetField')('createdBy');
    expect(field.label).to.eq('Created By');
  });

  it('onAction should call upsertAirports on SAVE action', () => {
    const upsertAirportSpy = sinon.spy(instance, 'upsertAirport');
    instance.onAction(GRID_ACTIONS.SAVE);
    expect(upsertAirportSpy.called).true;
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

  it('onAction should set the Status of an Airport on TOGGLE_STATUS action', () => {
    const updateStatusSpy = sinon.spy(instance, 'updateStatus');
    instance.onAction(GRID_ACTIONS.TOGGLE_STATUS);
    expect(updateStatusSpy.called).true;
  });

  it('onSearch should search Countries if entityType is COUNTRY', () => {
    const getCountriesSpy = sinon.spy(instance.airportStore, 'getCountries');
    instance.onSearch('TEST', 'airportLocation.country', SEARCH_ENTITY_TYPE.COUNTRY);
    expect(getCountriesSpy.called).true;

    // when searchValue is null
    instance.onSearch(null, 'airportLocation.country', SEARCH_ENTITY_TYPE.COUNTRY);
    expect(instance.airportStore.countries).to.be.empty;
  });

  it('onSearch should load cities if entityType is CITY', () => {
    const loadCitiesSpy = sinon.spy(instance, 'loadCities');
    instance.onSearch('TEST', 'airportLocation.city', SEARCH_ENTITY_TYPE.CITY);
    expect(loadCitiesSpy.calledWith('TEST')).true;
  });

  it('onSearch should search for icao code if entityType is ICAO_CODE', () => {
    const searchIcaoCodeSpy = sinon.spy(instance.airportSettingsStore, 'searchIcaoCode');
    instance.onSearch('TEST', 'icaoCode', SEARCH_ENTITY_TYPE.ICAO_CODE);
    expect(searchIcaoCodeSpy.calledWith('TEST')).true;
  });

  it('onSearch should search for uwa code if entityType is UWA_CODE', () => {
    instance.onSearch(null, 'uwaAirportCode', SEARCH_ENTITY_TYPE.UWA_CODE);
    expect(instance.airportSettingsStore.uwaCodes).to.be.empty;

    // else case
    const searchUwaCodeSpy = sinon.spy(instance.airportSettingsStore, 'loadUwaCodes');
    instance.onSearch('TEST', 'uwaAirportCode', SEARCH_ENTITY_TYPE.UWA_CODE);
    expect(searchUwaCodeSpy.called).true;
  });

  it('onSearch should search for regional code if entityType is REGIONAL_CODE', () => {
    instance.onSearch(null, 'regionalAirportCode', SEARCH_ENTITY_TYPE.REGIONAL_CODE);
    expect(instance.airportSettingsStore.regionalCodes).to.be.empty;

    // else case
    const searchRegionalCodeSpy = sinon.spy(instance.airportSettingsStore, 'loadRegionalCodes');
    instance.onSearch('TEST', 'regionalAirportCode', SEARCH_ENTITY_TYPE.REGIONAL_CODE);
    expect(searchRegionalCodeSpy.called).true;
  });

  it('should call onFocus with Focus key island', () => {
    instance.getField('airportLocation.country').set({ id: null });
    instance.onFocus('island');
    expect(instance.airportStore.islands).to.be.empty;

    // else case
    const getIslandsSpy = sinon.spy(instance.airportStore, 'getIslands');
    instance.getField('airportLocation.country').set({ id: 1 });
    instance.onFocus('island');
    expect(getIslandsSpy.called).true;
  });

  it('should call onFocus with Focus key airportFacilityType', () => {
    const loadAirportFacilityTypesSpy = sinon.spy(instance.airportSettingsStore, 'loadAirportFacilityTypes');
    instance.onFocus('airportFacilityType');
    expect(loadAirportFacilityTypesSpy.called).true;
  });

  it('onFocus should load airportFacilityAccessLevels', () => {
    const loadAirportFacilityAccessLevelsSpy = sinon.spy(
      instance.airportSettingsStore,
      'loadAirportFacilityAccessLevels'
    );
    instance.onFocus('airportFacilityAccessLevel');
    expect(loadAirportFacilityAccessLevelsSpy.called).true;
  });

  it('should call onFocus with Focus key airportOfEntry', () => {
    const loadAirportOfEntriesSpy = sinon.spy(instance.airportSettingsStore, 'loadAirportOfEntries');
    instance.onFocus('airportOfEntry');
    expect(loadAirportOfEntriesSpy.called).true;
  });

  it('should call onFocus with Focus key primaryRunway', () => {
    const getRunwaysSpy = sinon.spy(instance.airportStore, 'getRunways');
    instance.onFocus('primaryRunway');
    expect(getRunwaysSpy.called).true;
  });

  it('should call onFocus with Focus key airportDataSource', () => {
    const loadAirportDataSourcesSpy = sinon.spy(instance.airportSettingsStore, 'loadAirportDataSources');
    instance.onFocus('airportDataSource');
    expect(loadAirportDataSourcesSpy.called).true;
  });

  it('should call onFocus with Focus key appliedAirportType', () => {
    const loadAirportTypesSpy = sinon.spy(instance.airportSettingsStore, 'loadAirportTypes');
    instance.onFocus('appliedAirportType');
    expect(loadAirportTypesSpy.called).true;
  });

  it('should call onFocus with Focus key militaryUseType', () => {
    const loadAirportTypesSpy = sinon.spy(instance.airportSettingsStore, 'loadMilitaryUseTypes');
    instance.onFocus('militaryUseType');
    expect(loadAirportTypesSpy.called).true;
  });

  it('should call onFocus with Focus key distanceUOM', () => {
    const loadDistanceUOMsSpy = sinon.spy(instance.airportSettingsStore, 'loadDistanceUOMs');
    instance.onFocus('distanceUOM');
    expect(loadDistanceUOMsSpy.called).true;
  });

  it('should call onFocus with Focus key elevationUOM', () => {
    const loadDistanceUOMsSpy = sinon.spy(instance.airportSettingsStore, 'loadDistanceUOMs');
    instance.onFocus('elevationUOM');
    expect(loadDistanceUOMsSpy.called).true;
  });

  it('should call onFocus with Focus key airportDirection', () => {
    const loadAirportDirectionsSpy = sinon.spy(instance.airportSettingsStore, 'loadAirportDirections');
    instance.onFocus('airportDirection');
    expect(loadAirportDirectionsSpy.called).true;
  });

  it('should call onFocus with Focus key accessLevel', () => {
    const getAccessLevelsSpy = sinon.spy(instance.airportSettingsStore, 'getAccessLevels');
    instance.onFocus('accessLevel');
    expect(getAccessLevelsSpy.called).true;
  });

  it('should call onFocus with Focus key sourceType', () => {
    const getSourceTypesSpy = sinon.spy(instance.airportSettingsStore, 'getSourceTypes');
    instance.onFocus('sourceType');
    expect(getSourceTypesSpy.called).true;
  });

  it('onValueChange work properly according to fieldKey changes', () => {
    const clearFormFieldsSpy = sinon.spy(instance, 'clearFormFields');
    const getFieldSpy = sinon.spy(instance, 'getField');
    const validateAirportCodesSpy = sinon.spy(instance, 'validateAirportCodes');
    const loadAirportsSpy = sinon.spy(instance, 'loadAirports');
    const validateAirportNameSpy = sinon.spy(instance, 'validateAirportName');

    // onValueChange called with fieldKey icaoCode
    instance.onValueChange('ICAOCODE', 'icaoCode');
    expect(validateAirportCodesSpy.called).true;

    // if case for icaoCode
    instance.onValueChange(null, 'icaoCode');
    expect(instance.airportSettingsStore.ICAOCodes).to.be.empty;

    // onValueChange called with fieldKey iataCode
    instance.onValueChange('KAB', 'iataCode');
    expect(validateAirportCodesSpy.called).true;

    // onValueChange called with fieldKey name,cappsAirportName
    instance.onValueChange('TEST', 'name');
    expect(validateAirportNameSpy.called).true;

    // onValueChange called with fieldKey airportLocation.state
    instance.onValueChange('STATE', 'airportLocation.state');
    expect(clearFormFieldsSpy.calledWith(props.locationFields)).true;
    expect(loadAirportsSpy.called).true;

    // onValueChange called with fieldKey "airportLocation.distanceToDowntown.value"
    // if there is no value
    instance.onValueChange('', 'airportLocation.distanceToDowntown.value');
    expect(instance.getField('airportLocation.airportDirection').value).to.be.undefined;

    // else case
    instance.onValueChange('NORTH', 'airportLocation.distanceToDowntown.value');
    expect(getFieldSpy.calledWith('airportLocation.distanceUOM')).true;

    // onValueChange called with fieldKey airportLocation.country
    // if there is no value
    instance.onValueChange('', 'airportLocation.country');
    expect(instance.airportStore.countries).to.be.empty;

    // else
    instance.onValueChange('COUNTRY', 'airportLocation.country');
    expect(clearFormFieldsSpy.calledWith([...props.locationFields, 'airportLocation.state'])).true;

    // case for appliedAirportType
    instance.onValueChange('Test', 'appliedAirportType');
    expect(getFieldSpy.calledWith('militaryUseType')).true;

    // default case
    instance.onValueChange('TEST', 'airportDataSource');
    expect(instance.getField('airportDataSource').value).to.eq('TEST');
  });

  it('onValueChange called with fieldKeys city,closestCity', () => {
    // if case
    instance.onValueChange(null, 'airportLocation.city');
    expect(instance.airportStore.cities).to.be.empty;

    //else case
    const loadAirportsSpy = sinon.spy(instance, 'loadAirports');
    instance.onValueChange('CITY', 'airportLocation.city');
    expect(loadAirportsSpy.called).true;
  });

  it('should validate name properly with city', () => {
    instance.airportStore.airports = [
      new AirportModel({
        id: 1,
        name: 'case 1',
        airportLocation: new AirportLocationModel({ city: new CityModel({ id: 1 }) }),
      }),
      new AirportModel({
        id: 2,
        name: 'case 2',
        airportLocation: new AirportLocationModel({ closestCity: new CityModel({ id: 1 }) }),
      }),
      new AirportModel({
        id: 3,
        name: 'case 3 and 4',
        airportLocation: new AirportLocationModel({
          city: new CityModel({ id: 2 }),
          closestCity: new CityModel({ id: 2 }),
        }),
      }),
    ];

    // case 1 city selected should show error with same name
    // i.e name and city match
    instance.getField('airportLocation.city').set({ id: 1 });
    instance.getField('name').set('case 1');
    instance.validateAirportName();
    expect(instance.isAlreadyExistMap.get('name')).to.be.true;

    // case 2 no city selected compare with closestCity and show error
    // i.e name and closestCity match
    instance.isAlreadyExistMap.set('name', false);
    instance.getField('airportLocation.city').set(null);
    instance.getField('airportLocation.closestCity').set({ id: 1 });
    instance.getField('name').set('case 2');
    instance.validateAirportName();
    expect(instance.isAlreadyExistMap.get('name')).to.be.true;

    // case 3 city and closestCity selected compare with city as priority and show error
    // i.e name and city match
    instance.isAlreadyExistMap.set('name', false);
    instance.getField('airportLocation.city').set({ id: 2 });
    instance.getField('airportLocation.closestCity').set({ id: 2 });
    instance.getField('name').set('case 3 and 4');
    instance.validateAirportName();
    expect(instance.isAlreadyExistMap.get('name')).to.be.true;

    // case 4 should allow name if city is different and both values are provided for city and closestCity as we are selecting city as priority
    // i.e name match but city not match
    instance.isAlreadyExistMap.set('name', false);
    instance.getField('airportLocation.city').set({ id: 3 });
    instance.getField('airportLocation.closestCity').set({ id: 2 });
    instance.getField('name').set('case 3 and 4');
    instance.validateAirportName();
    expect(instance.isAlreadyExistMap.get('name')).to.be.false;
  });
});
