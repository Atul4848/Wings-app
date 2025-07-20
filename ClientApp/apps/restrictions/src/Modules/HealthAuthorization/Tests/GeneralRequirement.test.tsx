import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { ViewInputControl } from '@wings-shared/form-controls';
import {
  FLIGHT_ALLOWED,
  GeneralInfoModel,
  HealthAuthModel,
  HealthAuthorizationLinkModel,
  HealthAuthorizationNOTAMModel,
  HealthAuthStoreMock,
  SettingsStoreMock,
} from '../../Shared';
import { SettingsTypeModel } from '@wings-shared/core';
import { GeneralRequirement, HealthAuthorizationNOTAMGrid, HealthAuthLinkGrid } from '../Components';

describe('GeneralRequirement', () => {
  let wrapper: ShallowWrapper;

  const props = {
    getField: sinon.fake.returns({ value: true, values: sinon.fake(), set: sinon.fake() }),
    onChange: sinon.spy(),
    settingsStore: new SettingsStoreMock(),
    healthAuthStore: new HealthAuthStoreMock(),
    isEditable: true,
    setRules: sinon.fake(),
    onRowEdit: sinon.fake(),
    clearFields: sinon.fake(),
    healthAuth: new HealthAuthModel({ generalInformation: new GeneralInfoModel() }),
  };

  beforeEach(() => {
    wrapper = shallow(<GeneralRequirement {...props} />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should call onValueChange', () => {
    const viewInputControl = wrapper.find(ViewInputControl);
    viewInputControl.at(1).simulate('valueChange');
    expect(props.onChange.called).to.be.true;

    viewInputControl
      .at(4)
      .props()
      .onValueChange(true, 'generalInformation.isBusinessExemption');

    viewInputControl
      .at(4)
      .props()
      .onValueChange(false, 'generalInformation.isBusinessExemption');

    viewInputControl
      .at(2)
      .props()
      .onValueChange([new SettingsTypeModel()], 'generalInformation.flightsAllowed');

    viewInputControl
      .at(2)
      .props()
      .onValueChange(
        [new SettingsTypeModel({ id: 1, name: FLIGHT_ALLOWED.NO_FLIGHT })],
        'generalInformation.flightsAllowed'
      );

    viewInputControl
      .at(0)
      .props()
      .onValueChange([], 'generalInformation.isInherited');
  });

  it('should call onDataUpdate function', () => {
    wrapper
      .find(HealthAuthLinkGrid)
      .props()
      .onDataUpdate([new HealthAuthorizationLinkModel()]);
    wrapper
      .find(HealthAuthorizationNOTAMGrid)
      .props()
      .onDataUpdate([new HealthAuthorizationNOTAMModel()]);
  });

  // it('should call HealthAuthLinkGridV2 onRowEdit function', () => {
  //   wrapper
  //     .find(HealthAuthLinkGridV2)
  //     .props()
  //     .onRowEdit(true);
  // });

  // it('should call HealthAuthorizationNOTAMGridV2 onRowEdit function', () => {
  //   wrapper
  //     .find(HealthAuthorizationNOTAMGridV2)
  //     .props().onRowEdit()
  //     .onFocus('generalInformation.healthAuthorizationLinks');
  // });

  it('should render getOptionDisabled method', () => {
    const viewInputControl = wrapper.find(ViewInputControl).at(1);
    viewInputControl.prop('getOptionDisabled')(new SettingsTypeModel(), [new SettingsTypeModel()]);
    viewInputControl.prop('getOptionDisabled')(new SettingsTypeModel(), []);
    viewInputControl.prop('getOptionDisabled')(new SettingsTypeModel(), [
      new SettingsTypeModel({ id: 1, name: FLIGHT_ALLOWED.NO_FLIGHT }),
    ]);
  });

  it('should work with onFocus', () => {
    const viewInputControl = wrapper.find(ViewInputControl).at(1);
    viewInputControl.prop('onFocus')('healthAuthorizationBannedTraveledCountries');
    viewInputControl.prop('onFocus')('generalInformation.isBusinessExemption');
  });

  it('should work with onSearch', () => {
    const viewInputControl = wrapper.find(ViewInputControl).at(1);
    viewInputControl.prop('onSearch')('Test', 'healthAuthorizationBannedTraveledCountries');
    viewInputControl.prop('onSearch')('Test', 'generalInformation.isBusinessExemption');
  });
});
