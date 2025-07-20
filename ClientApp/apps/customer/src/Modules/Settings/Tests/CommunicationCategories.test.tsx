import { SettingsTypeModel } from '@wings-shared/core';
import { UpsertSettings } from '@wings/shared';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { SettingsStoreMock } from '../../Shared';
import { CommunicationCategories } from '../Components';

describe('Communication Categories Component', () => {
  let wrapper: any;

  const props = {
    settingsStore: new SettingsStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<CommunicationCategories {...props} />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  const getSettings = () => wrapper.find(UpsertSettings).prop('getSettings')();

  const upsertSettings = () => wrapper.find(UpsertSettings).prop('upsertSettings')(new SettingsTypeModel());

  it('should be rendered without errors, render UpsertSettings', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(UpsertSettings)).to.have.length(1);
  });

  it('should call get settings function', () => {
    const loadCommunicationCategories = sinon.spy(props.settingsStore, 'getCommunicationCategories');
    getSettings();
    expect(loadCommunicationCategories.called).to.be.true;
  });
  it('should call upsert settings function', () => {
    const upsertCommunicationCategories = sinon.spy(props.settingsStore, 'upsertCommunicationCategories');
    upsertSettings();
    expect(upsertCommunicationCategories.called).to.be.true;
  });
});
