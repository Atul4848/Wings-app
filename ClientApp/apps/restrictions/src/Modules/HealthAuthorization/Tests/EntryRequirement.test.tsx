import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { useRouterContext } from '@wings/shared';
import { HealthAuthStoreMock, SettingsStoreMock } from '../../Shared';
import { DetailsEditorHeaderSection } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';
import { EntryRequirement, HealthAuthorizationViewInputControls } from '../Components';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { Provider } from 'mobx-react';

describe('Entry requirement', () => {
  let wrapper: any;

  const props = {
    healthAuthStore: new HealthAuthStoreMock(),
    settingsStore: new SettingsStoreMock(),
  };
  const element = (
    <Provider {...props}>
      <ThemeProvider theme={createTheme(LightTheme)}>
        <EntryRequirement {...props} />
      </ThemeProvider>
    </Provider>
  );
  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should handle different actions correctly', () => {
    const onAction = wrapper.find(DetailsEditorHeaderSection).prop('onAction');
    // Simulate different actions
    onAction(GRID_ACTIONS.EDIT);
    expect(wrapper.find(DetailsEditorHeaderSection).prop('backNavTitle')).equal('Health Authorizations');
    onAction(GRID_ACTIONS.SAVE);
    onAction(GRID_ACTIONS.CANCEL);
  });

  it('should call onFocus function with HealthAuthorizationViewInputControls', () => {
    const viewInputControlsGroup = wrapper.find(HealthAuthorizationViewInputControls).props();
    viewInputControlsGroup.onFocus('testType');
    viewInputControlsGroup.onFocus('leadTimeIndicator');
    viewInputControlsGroup.onFocus('entryRequirementBannedNationalitiesRegions');
    viewInputControlsGroup.onFocus('entryRequirementBannedNationalities');
  });

  it('should call onValueChange function with ViewInputControlsGroup', () => {
    const viewInputControlsGroup = wrapper.find(HealthAuthorizationViewInputControls).props();
    viewInputControlsGroup.onValueChange(true, 'crewEntryRequirement.isEntryRequirements');
    viewInputControlsGroup.onValueChange(false, 'crewEntryRequirement.entryRequirementBannedNationalitiesRegions');
    viewInputControlsGroup.onValueChange(false, 'crewEntryRequirement.isFormsRequired');
    viewInputControlsGroup.onValueChange(true, 'crewEntryRequirement.isPreTravelTestRequired');
    viewInputControlsGroup.onValueChange(true, 'crewEntryRequirement.isInherited');
  });

  it('should call onSearch function with HealthAuthorizationViewInputControls', () => {
    const viewInputControlsGroup = wrapper.find(HealthAuthorizationViewInputControls).props();
    viewInputControlsGroup.onSearch(null, 'entryRequirementBannedNationalities');
  });

  it('should render the correct tabs and switch active tabs', () => {
    const viewInputControlsGroup = wrapper.find(HealthAuthorizationViewInputControls).props();
    const tabs = viewInputControlsGroup.tabs;

    // Validate tabs
    expect(tabs).to.be.an('array').that.is.not.empty;
    expect(tabs).to.include('Crew Entry Requirement');
    expect(wrapper.find(HealthAuthorizationViewInputControls).prop('activeTab')).to.equal('Crew Entry Requirement');
  });
});
