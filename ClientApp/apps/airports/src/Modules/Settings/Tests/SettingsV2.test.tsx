import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { SETTING_CATEGORIES, SETTING_ID, AirportSettingsStore } from '../../Shared';
import Settings from '../SettingsV2';
import { SettingsLayout, SidebarStore } from '@wings-shared/layout';

describe('Settings', () => {
  let wrapper: ShallowWrapper;

  const props = {
    settingsStore: new AirportSettingsStore(),
    sidebarStore: SidebarStore,
  };

  const optionChange = value =>
    wrapper
      .find(SettingsLayout)
      .dive()
      .at(0)
      .simulate('optionChange', value);

  beforeEach(() => {
    wrapper = shallow(<Settings airportSettingsStore={props.settingsStore} sidebarStore={props.sidebarStore} />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, should render SettingsLayout and UpsertSettings', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should set settings category', () => {
    wrapper
      .find(SettingsLayout)
      .at(0)
      .simulate('optionChange', SETTING_CATEGORIES.GENERAL);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.DISTANCE_UOM);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.SOURCE_TYPE);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.ACCESS_LEVEL);
  });
});
