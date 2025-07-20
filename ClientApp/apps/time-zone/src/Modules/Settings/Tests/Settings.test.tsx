import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import PureSettings from '../Settings';
import { SETTING_CATEGORIES, SETTING_ID, TimeZoneSettingsStoreMock } from '../../Shared';
import * as sinon from 'sinon';
import { SettingsLayout, SidebarStore } from '@wings-shared/layout';
import { SettingsModuleSecurity } from '@wings-shared/security';

describe('TimeZone Setting Module', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;
  const props = {
    classes: {},
    timeZoneSettingsStore: new TimeZoneSettingsStoreMock(),
    sidebarStore: SidebarStore,
  };

  const optionChange = value =>
    wrapper
      .find(SettingsLayout)
      .dive()
      .at(0)
      .simulate('optionChange', value);

  beforeEach(() => {
    wrapper = shallow(<PureSettings {...props} />).dive();
    wrapperInstance = wrapper.instance();
    sinon.stub(SettingsModuleSecurity, 'isEditable').value(true);
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
    optionChange(SETTING_ID.WORLD_EVENT_TYPE);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.WORLD_AWARE);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.SOURCE_TYPE);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.ACCESS_LEVEL);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.UA_OFFICE);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.WORLD_EVENT_CATEGORY);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.SPECIAL_CONSIDERATION);
  });
});
