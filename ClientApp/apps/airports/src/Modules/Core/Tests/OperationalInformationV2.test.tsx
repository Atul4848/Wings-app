import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import { AirportSettingsStoreMock, AirportStoreMock, EntityMapStoreMock } from '../../Shared/Mocks';
import { useRouterContext } from '@wings/shared';
import { OperationalInformation } from '../Components';
import { AirportModel, AirportOperationalInfoModel } from '../../Shared';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('Airport Operational InformationV2 Module', () => {
  let wrapper: ReactWrapper;
  let headerActions: ShallowWrapper;
  let viewInputControlsGroup;
  const selectedAirport = new AirportModel({
    airportOperationalInfo: new AirportOperationalInfoModel({ isGAFriendly: false }),
  });

  const props = {
    airportStore: new AirportStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    entityMapStore: new EntityMapStoreMock(),
    basePath: 'xyz',
    sidebarStore: SidebarStore,
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <OperationalInformation {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    props.airportStore.selectedAirport = selectedAirport;
    wrapper = mount(useRouterContext(element));
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
    viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    const groupInputControls = viewInputControlsGroup.prop('groupInputControls');
    expect(wrapper).to.have.lengthOf(1);
    expect(groupInputControls).to.have.lengthOf(10);
  });

  it('should return proper field by calling field Prop', () => {
    const field = viewInputControlsGroup.prop('field')('isGAFriendly');
    expect(field.label).to.eq('GA Friendly');
  });

  it('should call onFocus method', () => {
    const loadAirportCategory = sinon.spy(props.airportSettingsStore, 'loadAirportCategory');
    viewInputControlsGroup.prop('onFocus')('airportCategory');
    expect(loadAirportCategory.calledOnce).to.be.true;

    const loadWeatherReportingSystem = sinon.spy(props.airportSettingsStore, 'loadWeatherReportingSystem');
    viewInputControlsGroup.prop('onFocus')('weatherReportingSystem');
    expect(loadWeatherReportingSystem.calledOnce).to.be.true;

    const loadClassCode = sinon.spy(props.airportSettingsStore, 'loadClassCode');
    viewInputControlsGroup.prop('onFocus')('classCode');
    expect(loadClassCode.calledOnce).to.be.true;

    const loadCertificateCode = sinon.spy(props.airportSettingsStore, 'loadCertificateCode');
    viewInputControlsGroup.prop('onFocus')('certificateCode');
    expect(loadCertificateCode.calledOnce).to.be.true;

    const loadServiceCode = sinon.spy(props.airportSettingsStore, 'loadServiceCode');
    viewInputControlsGroup.prop('onFocus')('serviceCode');
    expect(loadServiceCode.calledOnce).to.be.true;

    const loadEntities = sinon.spy(props.entityMapStore, 'loadEntities');
    viewInputControlsGroup.prop('onFocus')('appliedFuelTypes');
    viewInputControlsGroup.prop('onFocus')('appliedOilTypes');
    expect(loadEntities.called).to.be.true;
  });

  it('should call onValueChange method', () => {
    viewInputControlsGroup.prop('onValueChange')(true, 'isForeignBasedEntity');
    expect(viewInputControlsGroup.prop('field')('jurisdiction').value).to.be.undefined;

    //else case
    viewInputControlsGroup.prop('onValueChange')(100, 'weightLimit');
    expect(viewInputControlsGroup.prop('field')('weightLimit').value).to.eq(100);
  });

  it('should call onSearch method', () => {
    viewInputControlsGroup.prop('onSearch')('', 'jurisdiction');
    expect(props.airportStore.countries).to.be.empty;

    const getCountriesSpy = sinon.spy(props.airportStore, 'getCountries');
    viewInputControlsGroup.prop('onSearch')('abc', 'jurisdiction');
    expect(getCountriesSpy.calledOnce).to.be.true;

    const getMetrosSpy = sinon.spy(props.airportStore, 'getMetros');
    viewInputControlsGroup.prop('onSearch')('Tokyo', 'metro');
    expect(getMetrosSpy.calledOnce).to.be.true;
  });

  it('onAction should call upsertAirportOperationalInfo on SAVE action', () => {
    const upsertAirportOperationalInfoSpy = sinon.spy(props.airportStore, 'upsertAirportOperationalInfo');
    headerActions.find(DetailsEditorHeaderSection).simulate('action', GRID_ACTIONS.SAVE);
    expect(upsertAirportOperationalInfoSpy.called).true;
  });
});
