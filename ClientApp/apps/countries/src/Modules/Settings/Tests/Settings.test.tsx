import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { SETTING_CATEGORIES, SETTING_ID, SettingsStoreMock } from '../../Shared';
import Settings from '../Settings';
import { SettingCategoryControl } from '@wings-shared/form-controls';
import { SettingsLayout, SidebarStore } from '@wings-shared/layout';

describe('Settings', () => {
  let wrapper: ShallowWrapper;

  const props = {
    settingsStore: new SettingsStoreMock(),
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
    optionChange(SETTING_ID.TERRITORY_TYPE);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.CAPPS_TERRITORY_TYPE);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.REGION_TYPE);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.STATE_TYPE);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.SECURITY_THREAT_LEVEL);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.AIP_SOURCE_TYPE);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.SOURCE_TYPE);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.ACCESS_LEVEL);
  });
});
