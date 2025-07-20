import { SettingsTypeModel } from '@wings-shared/core';
import { UpsertSettings } from '@wings/shared';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { SettingsStoreMock } from '../../Shared';
import { ServiceType } from '../Components';

describe('Service Type Component', () => {
  let wrapper: any;

  const props = {
    settingsStore: new SettingsStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<ServiceType {...props} />).dive();
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
    const loadServiceTypes = sinon.spy(props.settingsStore, 'getServiceType');
    getSettings();
    expect(loadServiceTypes.called).to.be.true;
  });
  it('should call upsert settings function', () => {
    const upsertServiceType = sinon.spy(props.settingsStore, 'upsertServiceType');
    upsertSettings();
    expect(upsertServiceType.called).to.be.true;
  });
});
