import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import { CountryModel, StateModel, useRouterContext } from '@wings/shared';
import { Ownership } from '../Components';
import { AirportAddressModel, AirportManagementModel, AirportModel, AirportStoreMock } from '../../Shared';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { SEARCH_ENTITY_TYPE, GRID_ACTIONS } from '@wings-shared/core';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { ViewInputControl } from '@wings-shared/form-controls';

describe('Ownership Module', () => {
  let wrapper: ReactWrapper;
  let headerActions: ShallowWrapper;
  let viewInputControl;

  const selectedAirport = new AirportModel({
    airportManagement: new AirportManagementModel({
      airportManagerName: 'TEST',
      airportManagerAddress: new AirportAddressModel({ country: new CountryModel({ id: 1 }) }),
      airportOwnerAddress: new AirportAddressModel({ country: new CountryModel({ id: 1 }) }),
    }),
  });

  const props = {
    airportStore: new AirportStoreMock(),
    basePath: 'xyz',
    sidebarStore: SidebarStore,
  };
  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <Ownership {...props} />
    </ThemeProvider>
  );

  const onValueChange = (index, value, fieldKey) =>
    viewInputControl
      .at(index)
      .props()
      .onValueChange(value, fieldKey);

  const onSearch = (index, value, fieldKey, entityType) => {
    viewInputControl
      .at(index)
      .props()
      .onSearch(value, fieldKey, entityType);
  };

  beforeEach(() => {
    props.airportStore.selectedAirport = selectedAirport;
    wrapper = mount(useRouterContext(element));
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
    viewInputControl = wrapper.find(ViewInputControl);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.lengthOf(1);
    expect(viewInputControl).to.have.lengthOf(18);
  });

  it('should return proper field by calling field Prop', () => {
    const field = viewInputControl.at(0).prop('field');
    expect(field.label).to.eq('Airport Manager Name');
  });

  it('onAction should call upsertAirportOperationalInfo on SAVE action', () => {
    const upsertSpy = sinon.spy(props.airportStore, 'upsertAirportManagementInfo');
    headerActions.find(DetailsEditorHeaderSection).simulate('action', GRID_ACTIONS.SAVE);
    expect(upsertSpy.called).true;
  });

  it('should test onValueChange with country field of Manager Address and Owner Address', () => {
    // if value is not there
    onValueChange(3, null, 'airportManagerAddress.country');
    onValueChange(12, null, 'airportOwnerAddress.country');
    expect(props.airportStore.countries).to.have.lengthOf(0);

    //else case
    const loadStatesSpy = sinon.spy(props.airportStore, 'getStates');
    const value = new CountryModel({ id: 1, name: 'India' });
    onValueChange(3, value, 'airportManagerAddress.country');
    onValueChange(12, value, 'airportOwnerAddress.country');
    expect(loadStatesSpy.callCount).to.be.eq(2);
  });

  it('should test onValueChange with field state and city fields', () => {
    // test for state fields
    const value = new StateModel({ id: 1, name: 'ABC' });
    onValueChange(4, value, 'airportManagerAddress.state');
    onValueChange(13, null, 'airportOwnerAddress.state');
    expect(props.airportStore.cities).to.have.lengthOf(0);

    // test for city fields
    onValueChange(5, null, 'airportOwnerAddress.city');
    onValueChange(14, null, 'airportManagerAddress.city');
    expect(props.airportStore.cities).to.have.lengthOf(0);

    // default case
    onValueChange(8, '144410', 'airportManagerAddress.zipCode');
    expect(viewInputControl.at(8).prop('field').value).to.eq('144410');
  });

  it('should test onSearch with field Country and City entityTypes', () => {
    // while searching for Countries
    const getCountriesSpy = sinon.spy(props.airportStore, 'getCountries');
    onSearch(12, 'India', 'airportOwnerAddress.country', SEARCH_ENTITY_TYPE.COUNTRY);
    expect(getCountriesSpy.called).to.be.true;

    // if searchValue is not there
    onSearch(12, null, 'airportOwnerAddress.country', SEARCH_ENTITY_TYPE.COUNTRY);
    expect(props.airportStore.countries).to.have.lengthOf(0);

    // while searching for Cities
    const searchCitiesSpy = sinon.spy(props.airportStore, 'searchCities');
    onSearch(14, 'TestCity', 'airportOwnerAddress.city', SEARCH_ENTITY_TYPE.CITY);
    expect(searchCitiesSpy.called).to.be.true;
  });
});
