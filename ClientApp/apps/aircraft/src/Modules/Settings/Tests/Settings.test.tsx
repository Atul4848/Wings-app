import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { UpsertSettings } from '@wings/shared';
import { SettingsTypeModel } from '@wings-shared/core';
import * as sinon from 'sinon';
import Settings from '../Settings';
import {
  SettingsStoreMock,
  SETTING_ID,
  SETTING_CATEGORIES,
  SettingsProfileModel,
  AvionicsSettingsStoreMock,
  EtpSettingsStoreMock,
  SpeedScheduleSettingsStoreMock,
} from '../../Shared';
import {
  UpsertSettingsProfile,
} from '../Components';
import { SettingsLayout, SidebarStore } from '@wings-shared/layout';

describe('Aircraft Setting Module', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;
  let settingsStore = new SettingsStoreMock();
  let avionicsSettingsStore = new AvionicsSettingsStoreMock();
  let etpSettingsStore = new EtpSettingsStoreMock();
  let speedScheduleSettingsStore = new SpeedScheduleSettingsStoreMock();

  const props = {
    classes: {},
    settingsStore,
    avionicsSettingsStore,
    etpSettingsStore,
    speedScheduleSettingsStore,
    sidebarStore: SidebarStore,
  };

  const optionChange = value =>
    wrapper
      .find(SettingsLayout)
      .dive()
      .at(0)
      .simulate('optionChange', value);

  beforeEach(() => {
    sinon.restore();
    wrapper = shallow(<Settings {...props} />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should set settings category', () => {
    wrapper
      .find(SettingsLayout)
      .at(0)
      .simulate('optionChange', SETTING_CATEGORIES.BASE);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.AIRCRAFT_COLOR);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.AIRCRAFT_MODIFICATION);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.AIRCRAFT_NOISE_TYPE);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.AIRFRAME_STATUS);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.CATEGORIES);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.ENGINE_TYPE);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.FIRE_CATEGORY);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.FLIGHT_PLAN_FORMAT_STATUS);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.ICAO_AERODROME_REFERENCE_CODE);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.AIRCRAFT_MAKE);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.MODEL);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.MILITARY_DESIGNATION);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.NFP_FUEL_RESERVE_TYPE);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.NOISE_CHAPTER);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.NOISE_CHAPTER_CONFIGURATION);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.NOISE_DATA_TYPE_CERTIFICATION);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.STC_MANUFACTURE);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.SERIES);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.SUB_CATEGORY);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.ICAO_TYPE_DESIGNATOR);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.WAKE_TURBULENCE_CATEGORY);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.OTHER_NAME);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.POPULAR_NAME);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.PROPULSION_TYPE);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.WAKE_TURBULENCE_GROUP);
  });

});
