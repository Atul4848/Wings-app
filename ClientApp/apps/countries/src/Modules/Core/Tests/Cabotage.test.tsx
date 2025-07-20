import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { CountryStoreMock, OperationalRequirementStoreMock, SettingsStoreMock } from '../../Shared';
import Cabotage from '../Components/OperationalRequirements/Cabotage/Cabotage';
import { Provider } from 'mobx-react';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';

describe('Cabotage Component', () => {
  let wrapper: any;

  const props = {
    useUpsert: {
      form: { values: 'Test' },
      getField: (fieldkey: string) => ({ value: null || { value: 1, label: 'Region' }, set: sinon.spy() }),
      setFormValues: () => 'Test',
      observeSearch: sinon.spy(),
      onValueChange: sinon.spy(),
      setFormFields: sinon.spy(),
    },
    countryStore: new CountryStoreMock(),
    operationalRequirementStore: new OperationalRequirementStoreMock(),
    settingsStore: new SettingsStoreMock(),
    classes: {},
    onValueChange: sinon.spy(),
    entityMapStore: sinon.spy(),
  };

  beforeEach(() => {
    wrapper = mount(
      <Provider operationalRequirementStore={props.operationalRequirementStore} settingsStore={props.settingsStore}>
        <Cabotage {...props} />
      </Provider>
    );
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should change the values with onChange function', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
    ['exemptionLevel', 'cabotageAssociatedEntities', 'cabotageEnforcedForFARTypes'].forEach(x =>
      viewInputControlsGroup.props().onValueChange([], x)
    );

    [
      'isCabotageEnforced',
      'isImportationFeesforDomesticFlight',
      'isCustomsStopsExempt',
      'isPaxMustDepartwithSameOperator',
      'isNoNewPaxAllowedtoDepart',
      'isCabotageAppliestoLivestock',
      'isCabotageAppliestoCargo',
      'isCabotageAppliestoNonResidents',
    ].forEach(x => viewInputControlsGroup.props().onValueChange(true, x));

    expect(props.useUpsert.onValueChange.callCount).to.equal(11);
  });

  it('should handle onFocus events correctly', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
    viewInputControlsGroup.prop('onFocus')('cabotageEnforcedforFARTypes');
    expect(props.useUpsert.observeSearch.calledOnce).to.be.true;
    viewInputControlsGroup.prop('onFocus')('exemptionLevel');
    expect(props.useUpsert.observeSearch.callCount).to.equal(2);
  });

  it('should change the values with onSearch function', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
    viewInputControlsGroup.props().onSearch('', 'cabotageAssociatedEntities');
  });
});
