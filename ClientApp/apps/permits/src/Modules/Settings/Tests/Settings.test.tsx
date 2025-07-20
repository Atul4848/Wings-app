import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import PureSettings from '../Settings';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { PermitSettingsStoreMock, SETTING_CATEGORIES, SETTING_ID } from '../../Shared';
import sinon from 'sinon';
import { SettingsLayout } from '@wings-shared/layout';

describe('Permit Settings Module', () => {
  let wrapper: ShallowWrapper;
  const props = {
    classes: {},
    permitSettingsStore: new PermitSettingsStoreMock(),
  };

  const optionChange = value =>
    wrapper
      .find(SettingsLayout)
      .dive()
      .at(0)
      .simulate('optionChange', value);

  beforeEach(() => {
    wrapper = shallow(<PureSettings {...props} />).dive();
    sinon.stub(SettingsModuleSecurity, 'isEditable').value(true);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors ', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should set settings category', () => {
    wrapper
      .find(SettingsLayout)
      .at(0)
      .simulate('optionChange', SETTING_CATEGORIES.PERMIT);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.BLANKET_VALIDITY);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.DOCUMENT);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.DIPLOMATIC_CHANNEL_REQUIRED);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.ELEMENTS);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.FAR_TYPE);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.FLIGHT_OPERATIONAL_CATEGORY);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.LEAD_TIME_TYPE);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.PERMIT_TYPE);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.PERMIT_APPLIED_TO);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.PERMIT_NUMBER_EXCEPTIONS);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.PERMIT_PREREQUISITES);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.PERMIT_REQUIREMENT_TYPE);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.PURPOSE_OF_FLIGHT);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.TIME_LEVEL_UOM);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.MISSION_ELEMENT);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.DATA_ELEMENT);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.CROSSING_TYPE);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.PERMIT_CLASSIFICATION);
  });
  
  it('should set settings sub category', () => {
    optionChange(SETTING_ID.PRESET_VALIDITY);
  });
  
});
    