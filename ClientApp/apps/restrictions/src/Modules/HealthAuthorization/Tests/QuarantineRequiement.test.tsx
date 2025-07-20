import React from 'react';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { useRouterContext } from '@wings/shared';
import { DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { HealthAuthStoreMock } from '../../Shared';
import {
  HealthAuthorizationContentWrapper,
  HealthAuthorizationViewInputControls,
  QuarantineRequirement,
} from '../Components';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { Field } from 'mobx-react-form';
import { GRID_ACTIONS } from '@wings-shared/core';
import { Provider } from 'mobx-react';

describe('Quarantine Requirement', () => {
  let wrapper: any;
  let headerActions: ShallowWrapper;

  const props = {
    classes: {},
    healthAuthStore: new HealthAuthStoreMock(),
  };

  const element = (
    <Provider {...props}>
      <ThemeProvider theme={createTheme(LightTheme)}>
        <QuarantineRequirement />
      </ThemeProvider>
    </Provider>
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
      'passengerQuarantineRequirement.isQuarantineRequired'
    );
    expect(field.label).to.eq('Quarantine Requirements');
  });

  it('should call onSearch function with HealthAuthorizationViewInputControls', () => {
    const viewInputControlsGroup = wrapper.find(HealthAuthorizationViewInputControls).props();
    viewInputControlsGroup.onSearch(null, 'quarantineTraveledCountries');
  });

  it('should call onSearch function with HealthAuthorizationViewInputControls', () => {
    const viewInputControlsGroup = wrapper.find(HealthAuthorizationViewInputControls).props();
    viewInputControlsGroup.onFocus(null, 'quarantineTraveledCountries');
    viewInputControlsGroup.onFocus('ab', 'quarantineLocations');
  });
  it('should call onValueChange function with ViewInputControlsGroup', () => {
    const viewInputControlsGroup = wrapper.find(HealthAuthorizationViewInputControls).props();
    viewInputControlsGroup.onValueChange(true, 'passengerQuarantineRequirement.isQuarantineRequired');
    viewInputControlsGroup.onValueChange(false, 'passengerQuarantineRequirement.isTestExemption');
    viewInputControlsGroup.onValueChange(false, 'passengerQuarantineRequirement.isGovtSelfMonitoringRequired');
    viewInputControlsGroup.onValueChange(true, 'passengerQuarantineRequirement.isLocationAllowed');
    viewInputControlsGroup.onValueChange(false, 'passengerQuarantineRequirement.isTravelHistoryBased');
    viewInputControlsGroup.onValueChange(false, 'passengerQuarantineRequirement.isPeriodOfQuarantineRequired');
    viewInputControlsGroup.onValueChange(true, 'passengerQuarantineRequirement.isAgeExemption');
    viewInputControlsGroup.onValueChange(false, 'passengerQuarantineRequirement.isInherited');
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
