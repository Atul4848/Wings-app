import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { UpsertSettings } from '@wings/shared';
import {RestrictionSource } from '../Components';
import { SettingsStoreMock } from '../../Shared';

describe('RestrictionSource', () => {
  let wrapper: ShallowWrapper;

  const props = {
    settingsStore: new SettingsStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<RestrictionSource {...props} />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors ', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should be rendered UpsertSettings without errors', () => {
    const upserSettings = wrapper.find(UpsertSettings);
    upserSettings.props().upsertSettings();
    upserSettings.props().getSettings();
  });
});
