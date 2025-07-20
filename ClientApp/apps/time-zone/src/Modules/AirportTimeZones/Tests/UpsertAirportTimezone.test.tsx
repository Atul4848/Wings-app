import * as React from 'react';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { of } from 'rxjs';
import { ViewInputControl, AuditFields, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { AirportModel, CountryModel, EditDialog, IslandModel, StateModel, VIEW_MODE } from '@wings/shared';
import { SettingsTypeModel, GRID_ACTIONS } from '@wings-shared/core';
import { Field } from 'mobx-react-form';
import {
  AirportLocationModel,
  AirportTimeZoneMappingStoreMock,
  TimeZoneDetailStoreMock,
  TimeZoneRegionModel,
  TimeZoneSettingsStoreMock,
  TimeZoneStoreMock,
} from '../../Shared';
import UpsertAirportTimezone from '../UpsertAirportTimezone/UpsertAirportTimezone';
import { MemoryRouter } from 'react-router';

describe('Upsert Airport Timezone', () => {
  let wrapper: any;
  let instance;
  const onUpsertAirportTimezone = sinon.spy((updatedIslandModel: AirportLocationModel) => of(null));
  let viewMode: VIEW_MODE.EDIT;
  //let dialogContent: ShallowWrapper;
  let dialogContent: ShallowWrapper;
  let wrapperInstance;

  const airportLocationModel = new AirportLocationModel({
    id: 1,
    airport: new AirportModel({ id: 1 }),
    timezoneRegion: new TimeZoneRegionModel({ id: 1 }),
    latitudeDegrees: 1,
    longitudeDegrees: 1,
    name: 'TEST',
    statusId: 1,
    accessLevelId: 1,
    sourceTypeId: 1,
  });

  const props = {
    viewMode: VIEW_MODE.EDIT,
    airportLocationModel,
    classes: {},
    onUpsertAirportTimezone,
    timeZoneStore: new TimeZoneStoreMock(),
    timeZoneDetailStore: new TimeZoneDetailStoreMock(),
    timeZoneSettingsStore: new TimeZoneSettingsStoreMock(),
    airportTimeZoneMappingStore: new AirportTimeZoneMappingStoreMock(),
    onValueChange: sinon.spy(),
  };

  beforeEach(function() {
    wrapper = shallow(<UpsertAirportTimezone {...props} />);
    dialogContent = shallow(<div>{wrapper.find(EditDialog).prop('tabContent')()}</div>);
    wrapperInstance = wrapper.instance();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(EditDialog)).to.be.ok;
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);

    //render ViewInputControl
    expect(dialogContent.find(ViewInputControl)).to.have.length(0);
  });

  it('should get proper field with AuditFields', () => {
    const field: Field = dialogContent.find(AuditFields).prop('onGetField')('createdBy');
    expect(field.label).to.eq('Created By');
  });

  it('should handle different actions correctly', () => {
    const onAction = wrapper.find(EditDialog).prop('onAction');
    // Simulate different actions
    onAction(GRID_ACTIONS.EDIT);
    onAction(GRID_ACTIONS.SAVE);
    onAction(GRID_ACTIONS.CANCEL);
    // Check if the correct functions were called
    expect(onUpsertAirportTimezone.calledOnce).to.be.true;
  });
});
