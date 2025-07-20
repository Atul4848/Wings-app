/* eslint-disable mocha/no-hooks-for-single-case */
/* eslint-disable mocha/no-setup-in-describe */
import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { GridApiMock } from '@wings/shared';
import { UIStore } from '@wings-shared/core';
import { SETTING_TYPE, SyncSettingsModel, SyncSettingsStoreMock } from '../../Shared';
import Settings from '../Components/Settings/Settings';
import { expect } from 'chai';
describe('Sync Settings', function() {
  let wrapper: ShallowWrapper;
  let instance;

  const props = {
    classes: {},
    syncSettingsStore: new SyncSettingsStoreMock(),
    settingType: SETTING_TYPE.SETTING,
  };

  beforeEach(function() {
    UIStore.setPageLoader(false);
    wrapper = shallow(<Settings {...props} />)
      .dive().dive();
    instance = wrapper.instance();
    instance.gridApi = new GridApiMock({ data: new SyncSettingsModel() });
  });

  afterEach(function() {
    wrapper.unmount();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('editViewRenderer should render view properly ', function() {
    expect(instance.editViewRenderer([ new SyncSettingsModel() ])).to.be.ok;
  });
  
  it('resetViewRenderer should render view properly ', function() {
    expect(instance.resetViewRenderer([ new SyncSettingsModel() ])).to.be.ok;
  });

 
});
