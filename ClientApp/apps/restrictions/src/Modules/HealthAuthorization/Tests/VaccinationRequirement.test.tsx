import React from 'react';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { useRouterContext } from '@wings/shared';
import { HealthAuthStoreMock, SettingsStoreMock } from '../../Shared';
import { DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';
import {
  HealthAuthorizationContentWrapper,
  HealthAuthorizationViewInputControls,
  VaccinationRequirement,
} from '../Components';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('Vaccination requirement', () => {
  let wrapper: any;
  let headerActions: ShallowWrapper;

  const healthAuthStore = new HealthAuthStoreMock();
  const settingsStore = new SettingsStoreMock();

  const props = {
    settingsStore,
    healthAuthStore,
  };
  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <VaccinationRequirement {...props} />
    </ThemeProvider>
  );
  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
    expect(headerActions).to.be.ok;
    expect(wrapper.find(HealthAuthorizationContentWrapper)).to.be.ok;
    expect(wrapper.find(HealthAuthorizationViewInputControls)).to.be.ok;
  });

  it('should get proper field with ViewInputControlsGroup', () => {
    const field: Field = wrapper.find(HealthAuthorizationViewInputControls).prop('getField')(
      'crewVaccinationRequirement.vaccinePrivileges'
    );
    expect(field.label).to.eq('Vaccine Privileges');
  });

  it('should call onSearch function with HealthAuthorizationViewInputControls', () => {
    const viewInputControlsGroup = wrapper.find(HealthAuthorizationViewInputControls).props();
    viewInputControlsGroup.onSearch(null, 'vaccinationRequirementIssuedCountries');
  });

  it('should call onFocus function with HealthAuthorizationViewInputControls', () => {
    const viewInputControlsGroup = wrapper.find(HealthAuthorizationViewInputControls).props();
    viewInputControlsGroup.onFocus(null, 'vaccinationRequirementIssuedCountries');
    viewInputControlsGroup.onFocus('ab', 'vaccineManufacturers');
    viewInputControlsGroup.onFocus('ab', 'vaccineBoosterManufacturers');
    viewInputControlsGroup.onFocus('ab', 'vaccinePrivileges');
  });
  it('should call onValueChange function with ViewInputControlsGroup', () => {
    const viewInputControlsGroup = wrapper.find(HealthAuthorizationViewInputControls).props();
    viewInputControlsGroup.onValueChange(true, 'crewVaccinationRequirement.vaccinePrivileges');
    viewInputControlsGroup.onValueChange(false, 'passengerVaccinationRequirement.isAgeExemption');
    viewInputControlsGroup.onValueChange(false, 'crewVaccinationRequirement.isDocumentationRequired');
    viewInputControlsGroup.onValueChange(true, 'crewVaccinationRequirement.isInherited');
    viewInputControlsGroup.onValueChange(false, 'crewVaccinationRequirement.isBoosterExpiry');
  });

  it('should handle different actions correctly', () => {
    const onAction = wrapper.find(DetailsEditorHeaderSection).prop('onAction');
    // Simulate different actions
    onAction(GRID_ACTIONS.EDIT);
    expect(wrapper.find(DetailsEditorHeaderSection).prop('backNavTitle')).equal('Health Authorizations');
    onAction(GRID_ACTIONS.SAVE);
    onAction(GRID_ACTIONS.CANCEL);
  });
});
