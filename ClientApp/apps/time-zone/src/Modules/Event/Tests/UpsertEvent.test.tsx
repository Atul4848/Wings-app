import React from 'react';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { VIEW_MODE, BaseAirportStore, useRouterContext } from '@wings/shared';
import UpsertEvent from '../UpsertEvent/UpsertEvent';
import sinon from 'sinon';
import { EventStoreMock, TimeZoneSettingsStoreMock } from '../../Shared';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('UpsertEvent Module', () => {
  let wrapper: any;
  let headerActions: ShallowWrapper;
  const eventStore = new EventStoreMock();
  const timeZoneSettingsStore = new TimeZoneSettingsStoreMock();
  const airportStore = new BaseAirportStore();
  const onActionSpy = sinon.spy();
  let viewInputControlsGroup;
  const props = {
    classes: {},
    eventStore,
    timeZoneSettingsStore,
    viewMode: VIEW_MODE.NEW,
    params: { eventId: '1', viewMode: VIEW_MODE.NEW },
    navigate: sinon.fake(),
    basePath: 'xyz',
    sidebarStore: SidebarStore,
    airportStore,
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <UpsertEvent {...props} />
    </ThemeProvider>
  );
  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
    viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
    const groupInputControls = viewInputControlsGroup.prop('groupInputControls');
    expect(groupInputControls[0].inputControls).to.have.lengthOf(13);
  });

  it('should return proper field by calling field Prop', () => {
    const field = viewInputControlsGroup.prop('field')('description');
    // should return proper field
    expect(field.label).to.eq('Description');
  });

  it('onAction should call upsertAirportFlightPlanInfo on SAVE action', () => {
    const upsertEventSpy = sinon.spy(props.eventStore, 'upsertEvent');
    headerActions.find(DetailsEditorHeaderSection).simulate('action', GRID_ACTIONS.SAVE);
    expect(upsertEventSpy.called).true;
  });

  it('should call onFocus method', () => {
    const loadWorldEventCategories = sinon.spy(props.timeZoneSettingsStore, 'getWorldEventCategory');
    viewInputControlsGroup.prop('onFocus')('eventCategory');
    expect(loadWorldEventCategories.calledOnce).to.be.true;

    const loadEventTypes = sinon.spy(props.timeZoneSettingsStore, 'getWorldEventTypes');
    viewInputControlsGroup.prop('onFocus')('eventType');
    expect(loadEventTypes.calledOnce).to.be.true;

    const loadUaOffices = sinon.spy(props.timeZoneSettingsStore, 'loadUAOffices');
    viewInputControlsGroup.prop('onFocus')('uaOffice');
    expect(loadUaOffices.calledOnce).to.be.true;

    const getWorldEventSpecialConsiderations = sinon.spy(
      props.timeZoneSettingsStore,
      'getWorldEventSpecialConsiderations'
    );
    viewInputControlsGroup.prop('onFocus')('specialConsiderations');
    expect(getWorldEventSpecialConsiderations.calledOnce).to.be.true;

    const getAccessLevels = sinon.spy(props.timeZoneSettingsStore, 'getAccessLevels');
    viewInputControlsGroup.prop('onFocus')('accessLevel');
    expect(getAccessLevels.calledOnce).to.be.true;

    const getSourceTypes = sinon.spy(props.timeZoneSettingsStore, 'getSourceTypes');
    viewInputControlsGroup.prop('onFocus')('sourceType');
    expect(getSourceTypes.calledOnce).to.be.true;
  });

  it('should call onValueChange method', () => {
    // Case: 'eventSchedule.is24Hours'
    viewInputControlsGroup.prop('onValueChange')(false, 'eventSchedule.is24Hours');
    expect(viewInputControlsGroup.prop('field')('eventSchedule.is24Hours').value).to.eq(false);

    // Case: 'eventSchedule.startDate'
    viewInputControlsGroup.prop('onValueChange')('', 'eventSchedule.startDate');
    expect(viewInputControlsGroup.prop('field')('eventSchedule.endDate').value).to.eq('');

    // Case: 'eventSchedule.startTime.time'
    viewInputControlsGroup.prop('onValueChange')('', 'eventSchedule.startTime.time');
    expect(viewInputControlsGroup.prop('field')('eventSchedule.endTime.time').value).to.eq('');

    // Case: 'region'
    viewInputControlsGroup.prop('onValueChange')('', 'region');
    expect(props.eventStore.regions).to.deep.equal([]);

    // Case: 'country'
    viewInputControlsGroup.prop('onValueChange')('', 'country');
    expect(props.eventStore.countries).to.deep.equal([]);
    expect(props.eventStore.cities).to.deep.equal([]);
    expect(props.eventStore.states).to.deep.equal([]);
    expect(viewInputControlsGroup.prop('field')('states').value).to.deep.equal([]);
    expect(viewInputControlsGroup.prop('field')('cities').value).to.deep.equal([]);

    // Case: 'state'
    viewInputControlsGroup.prop('onValueChange')([], 'states');
    expect(props.eventStore.states).to.deep.equal([]);

    // Case: Default case - other fields
    viewInputControlsGroup.prop('onValueChange')('new value', 'notes');
    expect(viewInputControlsGroup.prop('field')('notes').value).to.eq('new value');
  });

  it('should call onSearch method for region', () => {
    viewInputControlsGroup.prop('onSearch')('', 'region');
    expect(props.eventStore.states).to.deep.equal([]);

    const getRegions = sinon.spy(props.eventStore, 'getRegions');
    viewInputControlsGroup.prop('onSearch')('aa', 'region');
    expect(getRegions.calledOnce).to.be.true;
  });

  it('should call onSearch method for country', () => {
    viewInputControlsGroup.prop('onSearch')('', 'country');
    expect(props.eventStore.countries).to.deep.equal([]);
  });

  it('should call onSearch method for airports', () => {
    viewInputControlsGroup.prop('onSearch')('', 'airports');
    expect(props.airportStore.wingsAirports).to.deep.equal([]);
  });

  it('should call onSearch method for cities', () => {
    viewInputControlsGroup.prop('onSearch')('', 'cities');
    expect(props.eventStore.cities).to.deep.equal([]);

    const getCities = sinon.spy(props.eventStore, 'getCities');
    viewInputControlsGroup.prop('onSearch')('aa', 'cities');
    expect(getCities.calledOnce).to.be.true;
  });

  it('should call onSearch method for states', () => {
    viewInputControlsGroup.prop('onSearch')('', 'states');
    expect(props.eventStore.states).to.deep.equal([]);

    const getStates = sinon.spy(props.eventStore, 'getStates');
    viewInputControlsGroup.prop('onSearch')('aa', 'states');
    expect(getStates.calledOnce).to.be.true;
  });
});
