import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { CountryStoreMock, SettingsStoreMock } from '../../Shared';
import General from '../Components/OperationalRequirements/General/General';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';

describe('General Component', () => {
  let wrapper: any;

  const props = {
    useUpsert: {
      form: { values: 'Test' },
      getField: () => 'Test',
      setFormFields: sinon.spy(),
      setFormValues: () => 'Test',
      onValueChange: sinon.spy(),
      observeSearch: sinon.spy(),
    },
    countryStore: new CountryStoreMock(),
    settingsStore: new SettingsStoreMock(),
    classes: {},
  };

  beforeEach(() => {
    wrapper = mount(<General {...props} />);
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should handle onFocus events correctly', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
    viewInputControlsGroup.prop('onFocus')('fullAviationSecurityCheckRqrdOnDepartures');
    viewInputControlsGroup.prop('onFocus')('navigators');
    expect(props.useUpsert.observeSearch.callCount).to.equal(3); // Expect it to be called twice now
  });
});
