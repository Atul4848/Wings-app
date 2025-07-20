import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import {
  AircraftOperatorSettingsStoreMock,
  HealthAuthStoreMock,
  HealthVendorStoreMock,
  SETTING_CATEGORIES,
  SETTING_ID,
  SettingsStoreMock,
} from '../../Shared';
import Settings from '../Settings';
import sinon from 'sinon';
import { SettingsLayout, SidebarStore } from '@wings-shared/layout';

describe('Settings', () => {
  let wrapper: ShallowWrapper;

  const props = {
    settingsStore: new SettingsStoreMock(),
    healthAuthStore: new HealthAuthStoreMock(),
    healthVendorStore: new HealthVendorStoreMock(),
    aircraftOperatorSettingsStore: new AircraftOperatorSettingsStoreMock(),
    sidebarStore: SidebarStore,
  };

  const optionChange = value =>
    wrapper
      .find(SettingsLayout)
      .dive()
      .at(0)
      .simulate('optionChange', value);

  beforeEach(() => {
    wrapper = shallow(<Settings {...props} />).dive();
  });

  afterEach(() => {
    sinon.restore();
    wrapper.unmount();
  });

  it('should be rendered without errors ', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should set settings category', () => {
    wrapper
      .find(SettingsLayout)
      .at(0)
      .simulate('optionChange', SETTING_CATEGORIES.RESTRICTION);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.SOURCE_TYPE);
  });

  it('should work with Restriction Source', () => {
    optionChange(SETTING_ID.RESTRICTION_SOURCE);
  });

  it('should work with Quarantine Location', () => {
    optionChange(SETTING_ID.QUARANTINE_LOCATION);
  });

  it('should work with Lead Time Indicator', () => {
    optionChange(SETTING_ID.LEAD_TIME_INDICATOR);
  });

  it('should work with Flights allowed', () => {
    optionChange(SETTING_ID.FLIGHTS_ALLOWED);
  });

  it('should work with Aircraft Operator Restriction Time', () => {
    optionChange(SETTING_ID.AIRCRAFT_OPERATOR_RESTRICTION_TYPE);
  });

  it('should work with Restriction Severity', () => {
    optionChange(SETTING_ID.RESTRICTION_SEVERITY);
  });

  it('should work with Traveled History Sub Category', () => {
    optionChange(SETTING_ID.TRAVELED_HISTORY_SUB_CATEGORY);
  });
});
