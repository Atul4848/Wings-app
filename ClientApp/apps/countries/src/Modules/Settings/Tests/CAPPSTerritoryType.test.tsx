import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { CAPPSTerritoryTypeModel, SettingsType } from '@wings/shared';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { CAPPSTerritoryType } from '../Components';
import { SettingsStoreMock } from '../../Shared/Mocks';

describe('CAPPS Territory Type Module', function() {
  let wrapper: ShallowWrapper;
  let instance;

  beforeEach(function() {
    wrapper = shallow(<CAPPSTerritoryType settingsStore={new SettingsStoreMock()} />).shallow();
    sinon.stub(SettingsModuleSecurity, 'isEditable').value(true);
  });

  afterEach(function() {
    wrapper.unmount();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('CAPPS TerritoryType on get new model', () => {
    expect(wrapper.find(SettingsType).simulate('getNewModel')).to.have.length(1);
  });
});
