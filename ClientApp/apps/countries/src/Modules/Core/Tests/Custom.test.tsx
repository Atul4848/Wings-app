import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { CountryStoreMock, SettingsStoreMock } from '../../Shared';
import Custom from '../Components/OperationalRequirements/Custom/Custom';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';

describe('Custom Component', () => {
  let wrapper: any;

  const props = {
    useUpsert: {
      form: { values: 'Test' },
      getField: () => 'Test',
      setFormFields: sinon.spy(),
      setFormValues: () => 'Test',
      observeSearch: sinon.spy(),
      onValueChange: sinon.spy(),
      clearFormFields: sinon.spy(),
    },
    countryStore: new CountryStoreMock(),
    settingsStore: new SettingsStoreMock(),
    classes: {},
    onValueChange: sinon.spy(),
    entityMapStore: {
      searchEntities: sinon.spy(),
    },
  };

  beforeEach(() => {
    wrapper = mount(<Custom {...props} />);
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should change the values with onChange function', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
    [
      'allowableAlcoholClearance',
      'appliedDisinsectionDepartureCountries',
      'appliedDisinsectionTypes',
      'appliedDisinsectionChemicals',
      'appliedAPISRequirements',
      'weaponsOnBoardRequiredDocuments',
      'appliedWeaponInformations',
      'weaponOnBoardVendors',
    ].forEach(x => viewInputControlsGroup.props().onValueChange([], x));
    [
      'isAlcoholClearanceAllowed',
      'isDisinsectionRequired',
      'isAPISRequired',
      'isWeaponsOnBoardAllowed',
      'isNoNewPaxAllowedtoDepart',
      'isCabotageAppliestoLivestock',
      'isCabotageAppliestoCargo',
      'isCabotageAppliestoNonResidents',
    ].forEach(x => viewInputControlsGroup.props().onValueChange(true, x));

    expect(props.useUpsert.onValueChange.callCount).to.equal(16);
  });

  it('should handle onFocus events correctly', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
    viewInputControlsGroup.prop('onFocus')('apisSubmission');
    viewInputControlsGroup.prop('onFocus')('declarationRequiredForCashCurrency');
    expect(props.useUpsert.observeSearch.callCount).to.equal(4);
  });
});
