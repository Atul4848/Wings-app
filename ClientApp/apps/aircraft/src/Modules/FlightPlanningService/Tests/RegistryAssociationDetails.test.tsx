import React from 'react';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { FlightPlanningServiceModel, FlightPlanningServiceStoreMock, SettingsStoreMock } from '../../Shared';
import { VIEW_MODE } from '@wings/shared';
import RegistryAssociationDetails from '../RegistryAssociation/RegistryAssociationDetails';

describe('RegistryAssociationDetails', () => {
  let wrapper;
  let wrapperInstance: any;
  const onUpsertDetailSpy = sinon.fake();

  const props = {
    classes: {},
    viewMode: VIEW_MODE.EDIT,
    flightPlanningServiceStore: new FlightPlanningServiceStoreMock(),
    settingsStore: new SettingsStoreMock(),
    onUpsertDetail: onUpsertDetailSpy,
    flightPlanningServiceModel:new FlightPlanningServiceModel()
  };

  beforeEach(() => {
    wrapper = shallow(<RegistryAssociationDetails {...props} />).dive();
    wrapperInstance = wrapper.instance();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});
