import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { SettingsType } from '@wings/shared';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { FARType } from '../Components';
import { PermitSettingsStoreMock } from '../../Shared';

describe('FAR Type Module V2', function () {
  let wrapper: ShallowWrapper;
  let instance;

  beforeEach(function () {
    wrapper = shallow(<FARType permitSettingsStore={new PermitSettingsStoreMock()} />).shallow();
    instance = wrapper.instance();
    sinon.stub(SettingsModuleSecurity, 'isEditable').value(true);
  });

  afterEach(function () {
    wrapper.unmount();
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.have.length(1);
  });

  it('FAR Type on get new model', () => {
    expect(wrapper.find(SettingsType).simulate('getNewModel')).to.have.length(1);
  });
});